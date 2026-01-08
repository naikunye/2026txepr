import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, Package, Edit2, Trash2, Plane, Ship, Box, Save, Calculator, Truck, TrendingUp, DollarSign, Scale, Layers, Warehouse, FileText, Anchor, Image as ImageIcon, GitFork, UploadCloud, Wallet, Grid, X, ShieldAlert, Download, Upload, RefreshCw, CheckSquare, Square, Check, Clock, AlertTriangle } from 'lucide-react';
import { usePersistence } from '../hooks/usePersistence';

// --- World-Class ERP Data Model ---
interface Variant {
  id: string;
  suffix: string;      
  variantName: string; 
  quantity: number;    
}

interface Product {
  id: string;
  skuCode: string;
  productName: string;
  image: string; 
  variants?: Variant[]; 

  supplier: {
    name: string;
    link: string;
    moq: number; 
    unitPriceRMB: number; 
    leadTime: number; 
    paymentTerms: string; 
  };

  logistics: {
    inboundId: string; 
    trackingNo: string;
    mode: 'air' | 'sea' | 'rail';
    warehouseDest: string; 
    unitRateRMB: number; // Estimated Unit Rate
    totalFreightRMB?: number; // Manual Total Override
    dutyRate: number; 
    hsCode: string; 
    status: 'Plan' | 'Shipped' | 'Customs' | 'Received' | 'Exception';
    priority: 'urgent' | 'normal' | 'defer';
  };

  packing: {
    pcsPerBox: number;
    boxCount: number;
    boxWeightKg: number;
    boxVolumeCbm: number;
  };

  financials: {
    sellingPriceUSD: number;
    referralFeeRate: number;
    transactionFeeRate: number;
    fixedTransactionFeeUSD: number;
    affiliateRate: number;
    fulfillmentFeeUSD: number;     
    outboundHandlingFeeUSD: number; 
    storageFeeUSD: number;          
    adCostUSD: number; 
    targetRoas: number; 
    returnRate: number; 
    miscCostUSD: number;
  };

  inventory: {
    current: number;
    incoming: number;
    dailyVelocity: number; 
    safetyDays: number;
  };
}

// Mock Data
const initialProducts: Product[] = [
  { 
    id: '1', 
    skuCode: 'dsz-01-PRO', 
    productName: '战术登山杖 Pro (碳纤维版)', 
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop&q=60',
    variants: [
        { id: 'v1', suffix: '-BLK', variantName: 'Black', quantity: 120 },
        { id: 'v2', suffix: '-RED', variantName: 'Red', quantity: 45 },
        { id: 'v3', suffix: '-BLU', variantName: 'Blue', quantity: 35 },
    ],
    supplier: { name: '义乌市黑岩户外用品', link: '#', moq: 500, unitPriceRMB: 48.5, leadTime: 7, paymentTerms: '30/70' },
    logistics: { inboundId: 'LX-20240105-001', trackingNo: '1ZHV2525041299', mode: 'air', warehouseDest: 'ONT8', unitRateRMB: 38.0, totalFreightRMB: 4750, dutyRate: 0.15, hsCode: '6602.00.00', status: 'Shipped', priority: 'normal' },
    packing: { pcsPerBox: 20, boxCount: 10, boxWeightKg: 12.5, boxVolumeCbm: 0.08 },
    financials: { 
        sellingPriceUSD: 39.99, 
        referralFeeRate: 0.08, 
        transactionFeeRate: 0.029, 
        fixedTransactionFeeUSD: 0.3, 
        affiliateRate: 0.10, 
        fulfillmentFeeUSD: 5.80, 
        outboundHandlingFeeUSD: 1.50, 
        storageFeeUSD: 0.20,          
        adCostUSD: 8.00, 
        targetRoas: 3.5, 
        returnRate: 0.05,             
        miscCostUSD: 0.50 
    },
    inventory: { current: 60, incoming: 200, dailyVelocity: 8.5, safetyDays: 20 }
  },
  { 
    id: '2', 
    skuCode: 'K7500-MECH', 
    productName: 'K7500 机械键盘 (青轴)', 
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=60',
    variants: [],
    supplier: { name: '东莞电子严选', link: '#', moq: 1000, unitPriceRMB: 115.0, leadTime: 14, paymentTerms: '100% TT' },
    logistics: { inboundId: 'LX-20240108-009', trackingNo: 'MSK99882211', mode: 'sea', warehouseDest: 'LGB3', unitRateRMB: 850, totalFreightRMB: 0, dutyRate: 0.25, hsCode: '8471.60.00', status: 'Plan', priority: 'defer' },
    packing: { pcsPerBox: 10, boxCount: 50, boxWeightKg: 15.0, boxVolumeCbm: 0.12 },
    financials: { 
        sellingPriceUSD: 69.99, 
        referralFeeRate: 0.08, 
        transactionFeeRate: 0.029, 
        fixedTransactionFeeUSD: 0.3, 
        affiliateRate: 0.15, 
        fulfillmentFeeUSD: 9.20, 
        outboundHandlingFeeUSD: 2.00, 
        storageFeeUSD: 0.50,          
        adCostUSD: 15.00, 
        targetRoas: 4.0, 
        returnRate: 0.08,             
        miscCostUSD: 1.00 
    },
    inventory: { current: 990, incoming: 0, dailyVelocity: 42, safetyDays: 30 }
  }
];

const cleanNumber = (val: any): number => {
    if (typeof val === 'number') return val;
    if (val === undefined || val === null) return 0;
    
    const str = String(val).trim();
    if (str === '') return 0;

    if (str.includes('%')) {
        const num = parseFloat(str.replace(/[^\d.-]/g, '')); 
        return isNaN(num) ? 0 : num / 100;
    }

    const cleanStr = str.replace(/[^\d.-]/g, ''); 
    const num = parseFloat(cleanStr);
    return isNaN(num) ? 0 : num;
};

const sanitizeProduct = (p: any): Product => {
  const fuzzyVal = (obj: any, targets: string[], type: 'string'|'number', defaultVal: any) => {
    if (!obj || typeof obj !== 'object') return defaultVal;
    const objKeys = Object.keys(obj);
    for (const t of targets) {
        if (obj[t] !== undefined && obj[t] !== null && obj[t] !== '') {
            return type === 'number' ? cleanNumber(obj[t]) : String(obj[t]);
        }
    }
    for (const t of targets) {
        const lowerT = t.toLowerCase();
        const foundKey = objKeys.find(k => k.toLowerCase() === lowerT);
        if (foundKey && obj[foundKey] !== undefined && obj[foundKey] !== null) {
             return type === 'number' ? cleanNumber(obj[foundKey]) : String(obj[foundKey]);
        }
    }
    for (const t of targets) {
        if (t.length < 2) continue; 
        const lowerT = t.toLowerCase();
        const foundKey = objKeys.find(k => k.toLowerCase().includes(lowerT));
        if (foundKey && obj[foundKey] !== undefined && obj[foundKey] !== null && String(obj[foundKey]).trim() !== '') {
             return type === 'number' ? cleanNumber(obj[foundKey]) : String(obj[foundKey]);
        }
    }
    return defaultVal;
  };

  const root = p || {};
  const mixedPool = { ...root, ...(root.supplier || {}), ...(root.logistics || {}), ...(root.financials || {}), ...(root.packing || {}), ...(root.inventory || {}) };

  const inboundKeys = [
      'inboundId', 'inbound_id', 'Inbound ID', 
      'shipmentId', 'shipment_id', 'shipment_name', 'Shipment Name', 'Shipment ID',
      'fba_shipment_id', 'fba_shipment_name', 'fba_id', 'FBA ID',
      'seller_shipment_id', 'seller_shipment_name',
      'reference_id', 'Reference ID', 'Reference', 'ref_no',
      'lx_id', 'lx_no',
      'plan_no', 'plan_id', 'plan_name', 'inbound_plan_id',
      'local_shipment_id',
      '入库单号', '入库单名称', '入库计划单号',
      '货件编号', '货件名称', '货件单号', '货件ID',
      'FBA货件号', 'FBA号', 'FBA单号',
      '商家货件号', '计划单号', '单号'
  ];

  return {
    id: String(root.id || Date.now() + Math.random()),
    skuCode: fuzzyVal(mixedPool, ['skuCode', 'sku', 'item_no', 'Product ID', 'Item Number', '编码', '货号', 'SKU', 'MSKU', 'FNSKU'], 'string', 'UNKNOWN-SKU'),
    productName: fuzzyVal(mixedPool, ['productName', 'name', 'title', 'desc', 'Product Name', 'Description', '名称', '品名', '标题'], 'string', 'New Product'),
    image: fuzzyVal(mixedPool, ['image', 'img', 'thumb', 'pic', 'url', 'imageUrl', 'Photo', 'Picture', 'thumbnail', '图片', '缩略图', '主图'], 'string', ''),
    variants: Array.isArray(root.variants) ? root.variants : [],
    supplier: {
      name: fuzzyVal(mixedPool, ['supplierName', 'vendor', 'Supplier', 'Factory', '供应商', '厂家'], 'string', ''),
      link: fuzzyVal(mixedPool, ['link', 'url', '1688', 'Link', '链接', '采购链接'], 'string', '').substring(0, 1000), // CAP LENGTH to prevent lags
      moq: fuzzyVal(mixedPool, ['moq', 'MOQ', '起订量', '最小起订'], 'number', 0),
      unitPriceRMB: fuzzyVal(mixedPool, ['unitPriceRMB', 'cost', 'unitCost', 'Purchase Price', 'Cost RMB', 'factory_price', '采购价', '成本', '含税价', '单价', 'RMB', '进货价', 'price'], 'number', 0), 
      leadTime: fuzzyVal(mixedPool, ['leadTime', 'productionTime', 'Lead Time', '交期', '生产周期', '备货时间'], 'number', 0),
      paymentTerms: fuzzyVal(mixedPool, ['paymentTerms', 'Payment Terms', '付款方式', '账期'], 'string', ''),
    },
    logistics: {
      inboundId: fuzzyVal(mixedPool, inboundKeys, 'string', ''),
      trackingNo: fuzzyVal(mixedPool, ['trackingNo', 'tracking', 'waybill', 'Tracking Number', '追踪号', '运单号', '快递单号'], 'string', ''),
      mode: fuzzyVal(mixedPool, ['mode', 'transportMode', 'Method', '运输方式', '物流渠道'], 'string', 'sea') as any,
      warehouseDest: fuzzyVal(mixedPool, ['warehouseDest', 'warehouse', 'destination', 'Dest', '仓库', '目的仓', 'FBA仓'], 'string', ''),
      unitRateRMB: fuzzyVal(mixedPool, ['unitRateRMB', 'freight', 'shippingRate', 'Freight Cost', 'Shipping Fee', '头程', '运费单价', '物流费'], 'number', 0),
      totalFreightRMB: fuzzyVal(mixedPool, ['totalFreightRMB', 'Total Freight', '总运费', '头程总额'], 'number', 0),
      dutyRate: fuzzyVal(mixedPool, ['dutyRate', 'taxRate', 'Duty', '关税', '税率'], 'number', 0),
      hsCode: fuzzyVal(mixedPool, ['hsCode', 'HS Code', '海关编码'], 'string', ''),
      status: fuzzyVal(mixedPool, ['status', 'Status', '状态', '物流状态'], 'string', 'Plan') as any,
      priority: fuzzyVal(mixedPool, ['priority', 'Priority', '优先级'], 'string', 'normal') as any,
    },
    packing: {
      pcsPerBox: fuzzyVal(mixedPool, ['pcsPerBox', 'pcs_per_ctn', 'Pcs/Ctn', '装箱数', '每箱数量', 'Packing', 'Qty/Ctn', 'pcs_per_carton', '装箱量'], 'number', 0),
      boxCount: fuzzyVal(mixedPool, ['boxCount', 'ctn_count', 'Carton Count', '箱数', '件数', 'CTNS', 'Total Cartons', 'cartons', '总箱数'], 'number', 0),
      boxWeightKg: fuzzyVal(mixedPool, ['boxWeightKg', 'weight', 'Weight (kg)', '重量', '单箱重量', '毛重', 'G.W.', 'gross_weight', '整箱重'], 'number', 0),
      boxVolumeCbm: fuzzyVal(mixedPool, ['boxVolumeCbm', 'volume', 'cbm', 'CBM', '体积', '单箱体积', 'Meas', 'measurement', '外箱体积'], 'number', 0),
    },
    financials: {
      sellingPriceUSD: fuzzyVal(mixedPool, ['sellingPriceUSD', 'sellingPrice', 'tkPrice', 'Selling Price', 'Retail Price', 'USD Price', '售价', '销售价', '定价'], 'number', 0),
      referralFeeRate: fuzzyVal(mixedPool, ['referralFeeRate', 'commission', 'Platform Fee', '佣金', '平台佣金', 'Fee Rate', '扣点'], 'number', 0),
      transactionFeeRate: fuzzyVal(mixedPool, ['transactionFeeRate', '手续费', '支付费率'], 'number', 0),
      fixedTransactionFeeUSD: fuzzyVal(mixedPool, ['fixedTransactionFeeUSD', '固定费', 'fixed_fee'], 'number', 0),
      affiliateRate: fuzzyVal(mixedPool, ['affiliateRate', 'Affiliate', '达人佣金', 'TK佣金'], 'number', 0),
      fulfillmentFeeUSD: fuzzyVal(mixedPool, ['fulfillmentFeeUSD', 'fbaFee', 'Fulfillment', '尾程', '配送费', 'FBA费'], 'number', 0),
      outboundHandlingFeeUSD: fuzzyVal(mixedPool, ['outboundHandlingFeeUSD', '操作费', '出库费'], 'number', 0),
      storageFeeUSD: fuzzyVal(mixedPool, ['storageFeeUSD', 'Storage', '仓储费'], 'number', 0),
      adCostUSD: fuzzyVal(mixedPool, ['adCostUSD', 'cpa', 'Ads', 'Marketing', '广告费', 'CPA', '营销费'], 'number', 0),
      targetRoas: fuzzyVal(mixedPool, ['targetRoas', 'roas', 'ROAS', '投产比'], 'number', 0),
      returnRate: fuzzyVal(mixedPool, ['returnRate', 'Returns', '退货率', '退款率'], 'number', 0),
      miscCostUSD: fuzzyVal(mixedPool, ['miscCostUSD', 'Misc', '杂费', '其他费用'], 'number', 0),
    },
    inventory: {
        current: fuzzyVal(mixedPool, ['current', 'stock', 'qty', 'Stock', 'Quantity', '库存', '现有库存', '数量', 'available', '在库'], 'number', 0),
        incoming: fuzzyVal(mixedPool, ['incoming', 'Incoming', '在途', '在途库存', 'Shipping'], 'number', 0),
        dailyVelocity: fuzzyVal(mixedPool, ['dailyVelocity', 'sales_velocity', 'Velocity', '日销', '销量', '日均'], 'number', 0),
        safetyDays: fuzzyVal(mixedPool, ['safetyDays', 'Safety Days', '安全库存天数', '周转天数'], 'number', 0),
    }
  };
};

export const RestockModule: React.FC = () => {
  // Use Persistence Hook (Debounced)
  const [products, setProducts] = usePersistence<Product[]>('AERO_RESTOCK_DATA', initialProducts);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'supply' | 'logistics' | 'finance'>('finance'); // Modal tabs
  const [exchangeRate, setExchangeRate] = useState(7.25);
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // File Import Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for variant creator
  const [variantSuffix, setVariantSuffix] = useState('');
  const [variantName, setVariantName] = useState('');
  const [variantQty, setVariantQty] = useState('');

  // --- Filtered Products Logic (Calculated before render) ---
  const safeProducts = Array.isArray(products) ? products : [];
  const filteredProducts = safeProducts.filter(p => 
      p && (
         (p.skuCode || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
         (p.logistics?.inboundId || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // --- Batch Operations ---
  const toggleSelection = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (selectedIds.includes(id)) {
          setSelectedIds(selectedIds.filter(sid => sid !== id));
      } else {
          setSelectedIds([...selectedIds, id]);
      }
  };

  const toggleSelectAll = React.useCallback(() => {
      if (selectedIds.length === filteredProducts.length && filteredProducts.length > 0) {
          setSelectedIds([]);
      } else {
          setSelectedIds(filteredProducts.map(p => p.id));
      }
  }, [selectedIds, filteredProducts]);

  const handleBatchDelete = React.useCallback(() => {
      if (selectedIds.length === 0) return;
      if (confirm(`⚠️ 高危操作确认\n\n您确定要永久删除选中的 ${selectedIds.length} 个 SKU 吗？\n删除后不可恢复。`)) {
          const remaining = products.filter(p => !selectedIds.includes(p.id));
          setProducts(remaining);
          setSelectedIds([]);
      }
  }, [selectedIds, products, setProducts]);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

        if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput) {
            if (selectedIds.length > 0) {
                handleBatchDelete();
            }
        }

        if ((e.metaKey || e.ctrlKey) && e.key === 'a' && !isInput) {
            e.preventDefault();
            toggleSelectAll();
        }

        if (e.key === 'Escape') {
            setSelectedProduct(null);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, handleBatchDelete, toggleSelectAll]);


  // --- Logic Helpers ---
  const handleTrackingClick = (e: React.MouseEvent, trackingNo?: string) => {
    e.stopPropagation();
    if (trackingNo && trackingNo !== '待填追踪号') {
        window.open(`https://www.ups.com/track?loc=zh_CN&tracknum=${trackingNo}`, '_blank');
    }
  };

  const handleStatusUpdate = (e: React.ChangeEvent<HTMLSelectElement>, productId: string) => {
      e.stopPropagation();
      const newStatus = e.target.value as any;
      setProducts(products.map(p => 
          p.id === productId 
              ? { ...p, logistics: { ...p.logistics, status: newStatus } } 
              : p
      ));
  };

  const handlePriorityUpdate = (e: React.ChangeEvent<HTMLSelectElement>, productId: string) => {
      e.stopPropagation();
      const newPriority = e.target.value as any;
      setProducts(products.map(p => 
          p.id === productId 
              ? { ...p, logistics: { ...p.logistics, priority: newPriority } } 
              : p
      ));
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(products, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `AERO_OS_DATA_BACKUP_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const findBestDataArray = (obj: any): any[] | null => {
    const candidates: { array: any[], score: number }[] = [];

    const analyzeArray = (arr: any[]) => {
       if (!Array.isArray(arr) || arr.length === 0) return 0;
       let score = 0;
       const sample = arr.slice(0, 5); 
       for (const item of sample) {
          if (typeof item === 'object' && item !== null) {
             score += 1; 
             const keys = Object.keys(item).join(' ').toLowerCase();
             if (keys.includes('sku') || keys.includes('name') || keys.includes('title') || keys.includes('id')) score += 5;
             if (keys.includes('price') || keys.includes('cost') || keys.includes('image')) score += 2;
          }
       }
       return score + (arr.length * 0.1); 
    };

    const traverse = (node: any, depth: number) => {
       if (depth > 5) return; 
       if (typeof node !== 'object' || node === null) return;

       if (Array.isArray(node)) {
          const score = analyzeArray(node);
          if (score > 0) candidates.push({ array: node, score });
          return; 
       }

       for (const key in node) {
          if (typeof node[key] === 'string') {
             if (node[key].startsWith('[') || node[key].startsWith('{')) {
                try {
                   const parsed = JSON.parse(node[key]);
                   traverse(parsed, depth + 1);
                } catch(e) {}
             }
          } else {
             traverse(node[key], depth + 1);
          }
       }
    };

    traverse(obj, 0);
    candidates.sort((a, b) => b.score - a.score);
    if (candidates.length > 0) return candidates[0].array;
    return null;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rawText = e.target?.result as string;
        let json;
        try {
            json = JSON.parse(rawText);
        } catch (parseErr) {
            alert("文件错误：不是有效的 JSON 文件。");
            return;
        }

        const targetData = findBestDataArray(json);
        
        if (Array.isArray(targetData) && targetData.length > 0) {
          const normalizedData = targetData.map(item => sanitizeProduct(item));
          setProducts(normalizedData);
          alert(`✅ 系统恢复成功！\n\n成功导入 ${normalizedData.length} 个产品 SKU。\n智能字段映射已应用 (自动修复图片、价格、单号)。`);
        } else {
          console.error("Import failed. Structure:", json);
          const keys = typeof json === 'object' ? Object.keys(json).join(', ') : 'unknown';
          alert(`⚠️ 导入中断：虽然文件格式正确，但未能从中找到有效的产品列表数据。\n\n系统扫描了文件中的所有数组，但没有发现符合“产品数据”特征的内容。\n\n检测到的根键值: [${keys}]`);
        }
      } catch (err) {
        console.error(err);
        alert("严重错误：文件解析过程中发生未知错误。请检查控制台日志。");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const calculateEconomics = (p: Product) => {
    const unitProductCostUSD = (p.supplier?.unitPriceRMB || 0) / exchangeRate;
    const boxCount = p.packing?.boxCount || 0;
    const boxWeight = p.packing?.boxWeightKg || 0;
    const boxVol = p.packing?.boxVolumeCbm || 0;
    const pcsPerBox = p.packing?.pcsPerBox || 1;

    const totalWeight = boxCount * boxWeight;
    const totalVolume = boxCount * boxVol;
    const totalUnits = boxCount * pcsPerBox || 1; 

    let totalFreightRMB = 0;
    const mode = p.logistics?.mode || 'sea';
    const rate = p.logistics?.unitRateRMB || 0;
    const manualTotalFreight = p.logistics?.totalFreightRMB || 0;

    // Logic Priority: If manual total freight is set, use it. Otherwise, calculate from rate.
    if (manualTotalFreight > 0) {
        totalFreightRMB = manualTotalFreight;
    } else {
        if (mode === 'air') {
           totalFreightRMB = totalWeight * rate; 
        } else {
           totalFreightRMB = totalVolume * rate;
        }
    }

    const unitFreightUSD = (totalFreightRMB / totalUnits) / exchangeRate;
    const unitDutyUSD = unitProductCostUSD * (p.logistics?.dutyRate || 0);
    const landedCostUSD = unitProductCostUSD + unitFreightUSD + unitDutyUSD + (p.financials?.miscCostUSD || 0);

    const sellingPrice = p.financials?.sellingPriceUSD || 0;
    const referralFeeUSD = sellingPrice * (p.financials?.referralFeeRate || 0);
    const transactionFeeUSD = (sellingPrice * (p.financials?.transactionFeeRate || 0)) + (p.financials?.fixedTransactionFeeUSD || 0);
    const affiliateFeeUSD = sellingPrice * (p.financials?.affiliateRate || 0);
    
    const fulfillmentTotalUSD = (p.financials?.fulfillmentFeeUSD || 0) + (p.financials?.outboundHandlingFeeUSD || 0);
    const storageCostUSD = p.financials?.storageFeeUSD || 0;
    const returnLossUSD = sellingPrice * (p.financials?.returnRate || 0); 

    const totalServiceFees = referralFeeUSD + transactionFeeUSD + affiliateFeeUSD;
    const totalFulfillmentAndStorage = fulfillmentTotalUSD + storageCostUSD;
    
    const totalCost = landedCostUSD + totalServiceFees + totalFulfillmentAndStorage + returnLossUSD + (p.financials?.adCostUSD || 0);
    
    const netProfit = sellingPrice - totalCost;
    const margin = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;
    const roi = landedCostUSD > 0 ? (netProfit / landedCostUSD) * 100 : 0; 
    
    const inventory = p.inventory || { current: 0, incoming: 0, dailyVelocity: 0, safetyDays: 0 };
    const supplier = p.supplier || { moq: 0, unitPriceRMB: 0 };
    
    const daysOfCover = inventory.dailyVelocity > 0 ? (inventory.current + inventory.incoming) / inventory.dailyVelocity : 999;
    const needed = Math.max(0, (inventory.safetyDays - daysOfCover) * inventory.dailyVelocity);
    const reorderQty = Math.max(needed, supplier.moq);
    const capitalRequiredRMB = reorderQty * supplier.unitPriceRMB;

    const totalFreightBatchUSD = unitFreightUSD * reorderQty;
    const totalProfitBatchUSD = netProfit * reorderQty;

    return {
      unitProductCostUSD, unitFreightUSD, unitDutyUSD, landedCostUSD,
      referralFeeUSD, transactionFeeUSD, affiliateFeeUSD, 
      fulfillmentTotalUSD, storageCostUSD, returnLossUSD, 
      totalServiceFees,
      netProfit, margin, roi,
      daysOfCover, reorderQty, capitalRequiredRMB,
      totalUnits, totalWeight, totalVolume,
      totalFreightBatchUSD, totalProfitBatchUSD
    };
  };

  const handleUpdate = (field: string, value: any) => {
    if (!selectedProduct) return;
    const updateNested = (obj: any, path: string[], val: any): any => {
      const [head, ...tail] = path;
      if (!tail.length) return { ...obj, [head]: val };
      return { ...obj, [head]: updateNested(obj[head] || {}, tail, val) };
    };
    setSelectedProduct(updateNested(selectedProduct, field.split('.'), value));
  };

  const handleSave = () => {
    if (!selectedProduct) return;
    setProducts(products.map(p => p.id === selectedProduct.id ? selectedProduct : p));
    alert("SKU 信息保存成功！");
  };

  const handleSkuSplit = () => {
    if (!selectedProduct) return;
    const newSku = {
      ...selectedProduct,
      id: Date.now().toString(),
      skuCode: `${selectedProduct.skuCode}-V2`,
      productName: `${selectedProduct.productName} (Copy)`,
      logistics: { ...selectedProduct.logistics, inboundId: '', trackingNo: '' },
      variants: [] 
    };
    setProducts([newSku, ...products]);
    setSelectedProduct(newSku);
    alert(`SKU 裂变成功！已生成新变体: ${newSku.skuCode}`);
  };

  const handleAddVariant = () => {
    if(!selectedProduct) return;
    if(!variantSuffix || !variantName || !variantQty) {
      alert("请填写完整的变体信息（后缀、名称、数量）");
      return;
    }
    
    const newVariant: Variant = {
        id: Date.now().toString(),
        suffix: variantSuffix,
        variantName: variantName,
        quantity: parseInt(variantQty) || 0
    };

    const updatedProduct = {
        ...selectedProduct,
        variants: [...(selectedProduct.variants || []), newVariant]
    };
    
    setSelectedProduct(updatedProduct);
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));

    setVariantSuffix('');
    setVariantName('');
    setVariantQty('');
  };

  const handleRemoveVariant = (variantId: string) => {
      if (!selectedProduct) return;
      const updatedVariants = selectedProduct.variants?.filter(v => v.id !== variantId) || [];
      const updatedProduct = { ...selectedProduct, variants: updatedVariants };
      setSelectedProduct(updatedProduct);
      setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleCreateNew = () => {
      const newProduct: Product = {
          id: Date.now().toString(),
          skuCode: 'NEW-SKU-001',
          productName: '新建产品 (New Product)',
          image: '',
          variants: [],
          supplier: { name: '', link: '', moq: 100, unitPriceRMB: 0, leadTime: 7, paymentTerms: '' },
          logistics: { inboundId: '', trackingNo: '', mode: 'sea', warehouseDest: '', unitRateRMB: 0, totalFreightRMB: 0, dutyRate: 0, hsCode: '', status: 'Plan', priority: 'normal' },
          packing: { pcsPerBox: 0, boxCount: 0, boxWeightKg: 0, boxVolumeCbm: 0 },
          financials: { sellingPriceUSD: 0, referralFeeRate: 0.15, transactionFeeRate: 0.03, fixedTransactionFeeUSD: 0.3, affiliateRate: 0, fulfillmentFeeUSD: 0, outboundHandlingFeeUSD: 0, storageFeeUSD: 0, adCostUSD: 0, targetRoas: 0, returnRate: 0.05, miscCostUSD: 0 },
          inventory: { current: 0, incoming: 0, dailyVelocity: 0, safetyDays: 30 }
      };
      setProducts([newProduct, ...products]);
      setSelectedProduct(newProduct);
  };

  const renderDetailModal = () => {
    if (!selectedProduct) return null;
    const eco = calculateEconomics(selectedProduct);

    const TabButton = ({ id, label, icon: Icon }: any) => (
      <button 
        onClick={() => setActiveTab(id)}
        className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all flex-shrink-0 font-mono tracking-wide ${activeTab === id ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/5' : 'border-transparent text-gray-500 hover:text-white'}`}
      >
        <Icon size={14} /> {label}
      </button>
    );

    const content = (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300 p-0 lg:p-6">
         <div className="w-full h-full lg:max-w-[95vw] lg:h-[90vh] bg-[#0A0A0A] border border-white/10 flex flex-col shadow-2xl relative overflow-hidden lg:rounded-3xl apple-glass">
            
            {/* Ambient Noise Overlay */}
            <div className="absolute inset-0 bg-noise pointer-events-none opacity-20"></div>

            {/* 1. Header Toolbar (Compacted) */}
            <div className="h-auto border-b border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 bg-white/5 gap-4 shrink-0 relative z-10">
               <div className="flex items-center gap-4 w-full lg:w-auto">
                  <div 
                    className="group relative w-14 h-14 bg-black/50 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer hover:border-cyber-cyan/50 transition-all shrink-0 shadow-lg"
                    onClick={() => {
                        const url = prompt("请输入图片URL:", selectedProduct.image);
                        if (url) handleUpdate('image', url);
                    }}
                  >
                     {selectedProduct.image ? (
                       <img src={selectedProduct.image} alt="Product" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                     ) : (
                       <ImageIcon size={20} className="text-gray-600 group-hover:text-cyber-cyan transition-colors" />
                     )}
                     <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                        <UploadCloud size={16} className="text-white" />
                     </div>
                  </div>

                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2">
                        <h2 className="text-white font-black text-lg leading-tight tracking-tight truncate max-w-[300px]">
                            {selectedProduct.productName}
                        </h2>
                        <button 
                            className="text-gray-500 hover:text-cyber-cyan transition-colors shrink-0 p-1 rounded-full hover:bg-white/10"
                            onClick={() => {
                                const newName = prompt("请输入新的产品名称:", selectedProduct.productName);
                                if (newName) handleUpdate('productName', newName);
                            }}
                        >
                            <Edit2 size={14}/>
                        </button>
                     </div>
                     <div className="text-gray-400 text-[10px] font-mono mt-1 flex gap-2 items-center flex-wrap">
                        <span className="bg-white/10 px-1.5 py-0.5 rounded text-cyber-cyan font-bold tracking-wider border border-white/5">{selectedProduct.skuCode}</span>
                        <span className="text-gray-400 border border-white/10 px-1.5 py-0.5 rounded flex items-center gap-1 bg-black/30">
                           <Warehouse size={10} className="text-cyber-purple"/> {selectedProduct.logistics?.warehouseDest || 'N/A'}
                        </span>
                     </div>
                  </div>
                  
                  <button onClick={() => setSelectedProduct(null)} className="lg:hidden text-gray-400 hover:text-white p-2">
                      <X size={20} />
                  </button>
               </div>
               
               <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                   <button 
                     onClick={handleSkuSplit}
                     className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold hover:bg-purple-500 hover:text-white transition-all rounded-lg flex items-center gap-2 text-xs uppercase tracking-wider whitespace-nowrap"
                   >
                      <GitFork size={12} /> 复制
                   </button>

                   <div className="h-6 w-[1px] bg-white/10 mx-2 hidden lg:block"></div>

                   <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg whitespace-nowrap backdrop-blur-md">
                      <DollarSign size={12} className="text-cyber-green"/>
                      <span className="text-[10px] text-gray-400 font-mono uppercase">Rate:</span>
                      <input 
                        type="number" 
                        value={exchangeRate} 
                        onChange={e => setExchangeRate(parseFloat(e.target.value))}
                        className="w-12 bg-transparent text-white font-bold text-xs outline-none text-right font-mono border-b border-transparent focus:border-cyber-green transition-all"
                      />
                   </div>
                   <button onClick={() => setSelectedProduct(null)} className="hidden lg:block px-4 py-1.5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all rounded-lg text-xs font-bold whitespace-nowrap hover:bg-white/5">ESC 关闭</button>
                   <button 
                      onClick={handleSave}
                      className="px-6 py-1.5 bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-cyber-cyan hover:shadow-[0_0_20px_rgba(64,200,224,0.4)] transition-all rounded-lg flex items-center gap-2 text-xs whitespace-nowrap"
                   >
                      <Save size={14} /> 保存
                   </button>
               </div>
            </div>

            {/* 2. Main Content Grid */}
            <div className="flex-1 overflow-y-auto lg:overflow-hidden grid grid-cols-12 bg-transparent relative z-10">
               {/* LEFT PANEL */}
               <div className="col-span-12 lg:col-span-8 flex flex-col border-r border-white/5 bg-transparent lg:h-full min-h-0">
                  <div className="flex border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-20 lg:static overflow-x-auto no-scrollbar">
                     <TabButton id="supply" label="供应链 (SUPPLY)" icon={Layers} />
                     <TabButton id="logistics" label="物流 (LOGISTICS)" icon={Truck} />
                     <TabButton id="finance" label="财务 (FINANCE)" icon={DollarSign} />
                  </div>

                  <div className="p-5 lg:flex-1 lg:overflow-y-auto custom-scrollbar bg-black/20">
                     {activeTab === 'supply' && (
                       <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          {/* Section 1: Supplier */}
                          <div className="apple-glass p-5">
                             <h3 className="text-cyber-yellow font-bold text-xs uppercase mb-4 flex items-center gap-2 tracking-widest">
                                <Layers size={14} className="text-cyber-yellow"/> 供应商信息
                             </h3>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                   <label className="lbl">供应商全称</label>
                                   <input value={selectedProduct.supplier?.name || ''} onChange={e => handleUpdate('supplier.name', e.target.value)} className="input-holo w-full p-2 text-sm" />
                                </div>
                                <div>
                                   <label className="lbl text-cyber-yellow">采购单价 (RMB)</label>
                                   <input type="number" value={selectedProduct.supplier?.unitPriceRMB || 0} onChange={e => handleUpdate('supplier.unitPriceRMB', parseFloat(e.target.value))} className="input-holo w-full p-2 text-sm font-bold text-cyber-yellow" />
                                </div>
                                <div>
                                   <label className="lbl">备货数量 (MOQ)</label>
                                   <input type="number" value={selectedProduct.supplier?.moq || 0} onChange={e => handleUpdate('supplier.moq', parseFloat(e.target.value))} className="input-holo w-full p-2 text-sm" />
                                </div>
                                <div>
                                   <label className="lbl">生产周期 (天)</label>
                                   <input type="number" value={selectedProduct.supplier?.leadTime || 0} onChange={e => handleUpdate('supplier.leadTime', parseFloat(e.target.value))} className="input-holo w-full p-2 text-sm" />
                                </div>
                                <div>
                                   <label className="lbl">付款条款</label>
                                   <input value={selectedProduct.supplier?.paymentTerms || ''} onChange={e => handleUpdate('supplier.paymentTerms', e.target.value)} className="input-holo w-full p-2 text-sm" placeholder="e.g. 30% Deposit" />
                                </div>
                                <div className="col-span-2">
                                   <label className="lbl">1688 / 采购链接</label>
                                   <div className="relative flex items-center">
                                      <input 
                                        value={selectedProduct.supplier?.link || ''} 
                                        onChange={e => handleUpdate('supplier.link', e.target.value)} 
                                        className="input-holo w-full p-2 text-sm text-blue-400 cursor-pointer pr-8 hover:text-blue-300 underline underline-offset-4" 
                                      />
                                      {selectedProduct.supplier?.link && (
                                        <button 
                                          onClick={() => handleUpdate('supplier.link', '')}
                                          className="absolute right-2 text-gray-500 hover:text-white p-1 transition-colors"
                                          title="清空链接"
                                        >
                                          <X size={14} />
                                        </button>
                                      )}
                                   </div>
                                </div>
                             </div>
                          </div>
                          
                          {/* Section 2: Variant Generator */}
                          <div className="apple-glass p-5 border-cyber-purple/20 bg-cyber-purple/5">
                             <h3 className="text-cyber-purple font-bold text-xs uppercase mb-4 flex items-center gap-2 tracking-widest">
                                <Grid size={14} className="text-cyber-purple"/> 多规格矩阵 (SKU MATRIX)
                             </h3>
                             
                             <div className="flex flex-col lg:flex-row items-end gap-3 mb-4">
                                <div className="w-full lg:w-1/4">
                                   <label className="lbl text-cyber-purple">后缀 (Suffix)</label>
                                   <input 
                                      value={variantSuffix}
                                      onChange={e => setVariantSuffix(e.target.value)}
                                      className="input-holo w-full p-2 text-sm border-cyber-purple/30 focus:border-cyber-purple focus:shadow-[0_0_15px_rgba(192,38,211,0.3)]" 
                                      placeholder="-BLK" 
                                   />
                                </div>
                                <div className="w-full lg:flex-1">
                                   <label className="lbl text-cyber-purple">变体名称 (Name)</label>
                                   <input 
                                      value={variantName}
                                      onChange={e => setVariantName(e.target.value)}
                                      className="input-holo w-full p-2 text-sm border-cyber-purple/30 focus:border-cyber-purple focus:shadow-[0_0_15px_rgba(192,38,211,0.3)]" 
                                      placeholder="Black (XL)" 
                                   />
                                </div>
                                <div className="w-full lg:w-24">
                                   <label className="lbl text-cyber-purple">数量</label>
                                   <input 
                                      type="number"
                                      value={variantQty}
                                      onChange={e => setVariantQty(e.target.value)}
                                      className="input-holo w-full p-2 text-sm text-center border-cyber-purple/30 focus:border-cyber-purple focus:shadow-[0_0_15px_rgba(192,38,211,0.3)]" 
                                      placeholder="0" 
                                   />
                                </div>
                                <button 
                                   onClick={handleAddVariant}
                                   className="w-full lg:w-auto px-6 py-2 bg-cyber-purple text-white font-bold text-xs hover:bg-white hover:text-black transition-all shadow-[0_0_10px_rgba(192,38,211,0.4)] rounded-xl flex items-center justify-center gap-1"
                                >
                                   <Plus size={16} />
                                </button>
                             </div>

                             {/* Variants Table */}
                             {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                                <div className="border border-white/10 rounded-xl overflow-hidden bg-black/40 backdrop-blur-sm">
                                   <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                      <table className="w-full text-xs text-left">
                                         <thead className="bg-white/5 text-gray-400 font-mono text-[10px] uppercase sticky top-0 backdrop-blur-md z-10">
                                            <tr>
                                               <th className="p-3 font-bold tracking-wider">完整 SKU</th>
                                               <th className="p-3 font-bold tracking-wider">变体名称</th>
                                               <th className="p-3 font-bold tracking-wider text-right">数量</th>
                                               <th className="p-3 font-bold tracking-wider text-center">操作</th>
                                            </tr>
                                         </thead>
                                         <tbody className="divide-y divide-white/5">
                                            {selectedProduct.variants.map((v) => (
                                               <tr key={v.id} className="hover:bg-white/5 transition-colors group">
                                                  <td className="p-3 font-mono text-cyber-cyan font-bold tracking-wide">
                                                     {selectedProduct.skuCode}{v.suffix.startsWith('-') ? '' : '-'}{v.suffix}
                                                  </td>
                                                  <td className="p-3 text-gray-300 font-medium">
                                                     {v.variantName}
                                                  </td>
                                                  <td className="p-3 font-mono text-white text-right font-bold">
                                                     {v.quantity}
                                                  </td>
                                                  <td className="p-3 text-center">
                                                     <button 
                                                       onClick={() => handleRemoveVariant(v.id)}
                                                       className="text-gray-600 hover:text-red-500 transition-colors p-1.5 hover:bg-red-500/10 rounded-lg"
                                                     >
                                                        <Trash2 size={12} />
                                                     </button>
                                                  </td>
                                               </tr>
                                            ))}
                                         </tbody>
                                      </table>
                                   </div>
                                   <div className="bg-white/5 text-[10px] font-mono text-gray-400 p-2 flex justify-between border-t border-white/5">
                                      <span>TOTAL: {selectedProduct.variants.length}</span>
                                      <span className="text-white font-bold">QTY: {selectedProduct.variants.reduce((sum, v) => sum + v.quantity, 0)}</span>
                                   </div>
                                </div>
                             ) : (
                                <div className="text-center py-8 text-gray-600 text-[10px] font-mono border border-dashed border-gray-800 rounded-xl bg-black/20">
                                   // NO VARIANTS DETECTED //
                                </div>
                             )}
                          </div>

                          {/* Section 3: Packing */}
                          <div className="apple-glass p-5">
                             <h3 className="text-gray-400 font-bold text-xs uppercase mb-4 flex items-center gap-2 tracking-widest">
                                <Box size={14}/> 装箱规格 (PACKING)
                             </h3>
                             <div className="grid grid-cols-4 gap-4">
                                <div>
                                   <label className="lbl">每箱数量 (Pcs/Box)</label>
                                   <input type="number" value={selectedProduct.packing?.pcsPerBox || 0} onChange={e => handleUpdate('packing.pcsPerBox', parseFloat(e.target.value))} className="input-holo w-full p-2 text-sm" />
                                </div>
                                <div>
                                   <label className="lbl">总箱数 (Boxes)</label>
                                   <input type="number" value={selectedProduct.packing?.boxCount || 0} onChange={e => handleUpdate('packing.boxCount', parseFloat(e.target.value))} className="input-holo w-full p-2 text-sm" />
                                </div>
                                <div>
                                   <label className="lbl">单箱重量 (KG)</label>
                                   <input type="number" value={selectedProduct.packing?.boxWeightKg || 0} onChange={e => handleUpdate('packing.boxWeightKg', parseFloat(e.target.value))} className="input-holo w-full p-2 text-sm" />
                                </div>
                                <div>
                                   <label className="lbl">单箱体积 (CBM)</label>
                                   <input type="number" value={selectedProduct.packing?.boxVolumeCbm || 0} onChange={e => handleUpdate('packing.boxVolumeCbm', parseFloat(e.target.value))} className="input-holo w-full p-2 text-sm" />
                                </div>
                             </div>
                             <div className="mt-4 p-3 bg-black/40 border border-white/10 rounded-xl flex justify-between gap-4 text-[10px] font-mono text-gray-500 shadow-inner">
                                <span>TOTAL UNITS: <span className="text-white font-bold ml-1">{eco.totalUnits}</span></span>
                                <span>TOTAL WEIGHT: <span className="text-white font-bold ml-1">{eco.totalWeight.toFixed(2)} kg</span></span>
                                <span>TOTAL VOLUME: <span className="text-white font-bold ml-1">{eco.totalVolume.toFixed(3)} cbm</span></span>
                             </div>
                          </div>
                       </div>
                     )}

                     {activeTab === 'logistics' && (
                       <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="apple-glass p-5">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-cyber-cyan font-bold text-xs uppercase flex items-center gap-2 tracking-widest">
                                    <Truck size={14}/> 物流单证
                                </h3>
                             </div>
                             <div className="grid grid-cols-3 gap-4 mb-2">
                                <div>
                                   <label className="lbl flex items-center gap-1 text-cyber-cyan"><FileText size={10} /> 入库单号 (Inbound ID)</label>
                                   <input 
                                     value={selectedProduct.logistics?.inboundId || ''} 
                                     onChange={e => handleUpdate('logistics.inboundId', e.target.value)} 
                                     className="input-holo w-full p-2 text-sm border-cyber-cyan/30 text-cyber-cyan font-bold font-mono tracking-wide"
                                     placeholder="LX-..." 
                                   />
                                </div>
                                <div>
                                   <label className="lbl flex items-center gap-1"><Anchor size={10} /> 追踪号 (Tracking)</label>
                                   <div className="flex gap-2">
                                       <input 
                                         value={selectedProduct.logistics?.trackingNo || ''} 
                                         onChange={e => handleUpdate('logistics.trackingNo', e.target.value)} 
                                         className="input-holo flex-1 p-2 text-sm font-mono"
                                         placeholder="1Z..." 
                                       />
                                   </div>
                                </div>
                                <div>
                                   <label className="lbl">目的仓库 (Warehouse)</label>
                                   <input value={selectedProduct.logistics?.warehouseDest || ''} onChange={e => handleUpdate('logistics.warehouseDest', e.target.value)} className="input-holo w-full p-2 text-sm" placeholder="ONT8" />
                                </div>
                                <div>
                                   <label className="lbl">物流状态</label>
                                   <select value={selectedProduct.logistics?.status || 'Plan'} onChange={e => handleUpdate('logistics.status', e.target.value)} className="input-holo w-full p-2 text-sm appearance-none bg-no-repeat bg-right">
                                      <option value="Plan">计划中 (Plan)</option>
                                      <option value="Shipped">已发货 (Shipped)</option>
                                      <option value="Customs">清关中 (Customs)</option>
                                      <option value="Received">已入库 (Received)</option>
                                      <option value="Exception">异常延误 (Exception)</option>
                                   </select>
                                </div>
                                <div className="col-span-2">
                                   <label className="lbl text-cyber-cyan">头程总运费 (Total RMB)</label>
                                   <input 
                                     type="number" 
                                     value={selectedProduct.logistics?.totalFreightRMB || 0} 
                                     onChange={e => handleUpdate('logistics.totalFreightRMB', parseFloat(e.target.value))} 
                                     className="input-holo w-full p-2 text-sm font-bold text-cyber-cyan border-cyber-cyan/30" 
                                     placeholder="0.00" 
                                   />
                                   <div className="text-[9px] text-gray-500 mt-1 text-right">
                                      {(selectedProduct.logistics?.totalFreightRMB || 0) > 0 ? '已覆盖预估计算' : '使用单价自动计算'}
                                   </div>
                                </div>
                             </div>
                          </div>

                          <div className="apple-glass p-5">
                             <h3 className="text-gray-400 font-bold text-xs uppercase mb-4 flex items-center gap-2 tracking-widest">
                                <Plane size={14}/> 运输与清关成本
                             </h3>
                             <div className="grid grid-cols-3 gap-4">
                                <div>
                                   <label className="lbl">运输方式</label>
                                   <select value={selectedProduct.logistics?.mode || 'sea'} onChange={e => handleUpdate('logistics.mode', e.target.value)} className="input-holo w-full p-2 text-sm">
                                      <option value="air">✈️ 空运 (Air)</option>
                                      <option value="sea">🚢 海运 (Sea)</option>
                                      <option value="rail">🚆 铁路 (Rail)</option>
                                   </select>
                                </div>
                                <div>
                                   <label className="lbl">运费单价 ({selectedProduct.logistics?.mode === 'air' ? '¥/KG' : '¥/CBM'})</label>
                                   <input type="number" value={selectedProduct.logistics?.unitRateRMB || 0} onChange={e => handleUpdate('logistics.unitRateRMB', parseFloat(e.target.value))} className="input-holo w-full p-2 text-sm" disabled={(selectedProduct.logistics?.totalFreightRMB || 0) > 0} />
                                </div>
                                <div>
                                   <label className="lbl">海关编码 (HS Code)</label>
                                   <input value={selectedProduct.logistics?.hsCode || ''} onChange={e => handleUpdate('logistics.hsCode', e.target.value)} className="input-holo w-full p-2 text-sm font-mono" />
                                </div>
                                <div>
                                   <label className="lbl">关税税率 (Duty %)</label>
                                   <div className="relative">
                                      <input type="number" value={((selectedProduct.logistics?.dutyRate || 0) * 100).toFixed(2)} onChange={e => handleUpdate('logistics.dutyRate', parseFloat(e.target.value)/100)} className="input-holo w-full p-2 text-sm pr-6" />
                                      <span className="absolute right-2 top-2.5 text-[10px] text-gray-500 font-bold">%</span>
                                   </div>
                                </div>
                                <div>
                                   <label className="lbl">杂费预估 (USD/Unit)</label>
                                   <input type="number" value={selectedProduct.financials?.miscCostUSD || 0} onChange={e => handleUpdate('financials.miscCostUSD', parseFloat(e.target.value))} className="input-holo w-full p-2 text-sm" />
                                </div>
                             </div>
                          </div>
                       </div>
                     )}
                  </div>
               </div>

               {/* RIGHT PANEL: LIVE ANALYTICS (Fixed) */}
               <div className="col-span-12 lg:col-span-4 bg-black/40 p-5 flex flex-col border-l border-white/10 shadow-2xl lg:h-full lg:overflow-y-auto backdrop-blur-xl relative">
                  {/* Subtle Background Mesh for Analytics */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 pointer-events-none"></div>
                  
                  <div className="mb-4 relative z-10">
                     <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2 tracking-wide">
                        <Scale size={16} className="text-cyber-green"/> 利润瀑布流
                     </h3>

                     <div className="space-y-2 font-mono text-xs relative">
                        {/* Connecting Line */}
                        <div className="absolute left-[11px] top-3 bottom-12 w-[2px] bg-gradient-to-b from-white/20 to-transparent"></div>
                        
                        <div className="flex justify-between items-center py-2 border-b border-white/10 relative z-10 bg-transparent">
                           <span className="text-gray-300 font-bold">销售价格 (Price)</span>
                           <span className="text-white font-bold text-lg">${(selectedProduct.financials?.sellingPriceUSD || 0).toFixed(2)}</span>
                        </div>

                        {[
                          { l: '产品成本', v: eco.unitProductCostUSD, c: 'text-gray-400' },
                          { l: '头程运费', v: eco.unitFreightUSD, c: 'text-gray-400' },
                          { l: '进口关税', v: eco.unitDutyUSD, c: 'text-gray-400' },
                          { l: '平台费率', v: eco.totalServiceFees, c: 'text-red-400' },
                          { l: '履约与操作', v: eco.fulfillmentTotalUSD, c: 'text-blue-400' }, 
                          { l: '仓储与损耗', v: eco.storageCostUSD + eco.returnLossUSD, c: 'text-orange-400' }, 
                          { l: '广告支出', v: selectedProduct.financials?.adCostUSD || 0, c: 'text-cyber-purple' },
                        ].map((item, i) => (
                          <div key={i} className="flex justify-between text-[10px] relative pl-8 py-0.5">
                             <div className="absolute left-[8px] top-[6px] w-[6px] h-[6px] rounded-full bg-[#1c1c1e] border-2 border-gray-600"></div>
                             <span className={`${item.c} opacity-90 tracking-wide font-bold uppercase`}>{item.l}</span>
                             <span className="text-gray-300 font-bold">${item.v.toFixed(2)}</span>
                          </div>
                        ))}

                        <div className="mt-4 pt-4 border-t border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4 rounded-xl border border-white/5 shadow-2xl relative overflow-hidden group">
                           <div className={`absolute inset-0 opacity-10 transition-colors duration-500 ${eco.netProfit > 0 ? 'bg-cyber-green' : 'bg-cyber-red'}`}></div>
                           
                           <div className="flex justify-between items-center mb-2 relative z-10">
                              <span className="text-white font-bold text-[10px] uppercase tracking-widest opacity-80">净利润 (Net Profit)</span>
                              <span className={`text-3xl font-black ${eco.netProfit > 0 ? 'text-cyber-green text-glow-green' : 'text-cyber-red text-glow-red'}`}>
                                 ${eco.netProfit.toFixed(2)}
                              </span>
                           </div>
                           <div className="flex justify-between gap-2 text-[10px] font-bold font-mono mt-2 relative z-10">
                              <span className="bg-black/40 px-2 py-1 rounded text-gray-300 border border-white/5">Margin: <span className={eco.margin > 15 ? 'text-cyber-green' : 'text-orange-500'}>{eco.margin.toFixed(1)}%</span></span>
                              <span className="bg-black/40 px-2 py-1 rounded text-gray-300 border border-white/5">ROI: <span className="text-blue-400">{eco.roi.toFixed(0)}%</span></span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="border border-white/10 bg-black/30 p-4 rounded-xl mt-auto relative overflow-hidden group hover:border-cyber-yellow/50 transition-colors">
                     <div className="absolute top-0 right-0 p-2 opacity-20"><Calculator size={48}/></div>
                     <h4 className="text-cyber-yellow font-bold text-xs mb-4 flex items-center gap-2 tracking-widest relative z-10">
                        <Calculator size={14}/> 智能备货建议
                     </h4>
                     
                     <div className="grid grid-cols-2 gap-3 mb-4 text-[10px] font-mono relative z-10">
                        <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                           <div className="text-gray-500 mb-1 font-bold uppercase">安全库存</div>
                           <div className="text-white font-black text-sm">{selectedProduct.inventory?.safetyDays || 0} 天</div>
                        </div>
                        <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                           <div className="text-gray-500 mb-1 font-bold uppercase">当前可售</div>
                           <div className={`text-sm font-black ${eco.daysOfCover < (selectedProduct.inventory?.safetyDays || 0) ? "text-cyber-red animate-pulse" : "text-white"}`}>
                              {eco.daysOfCover.toFixed(0)} 天
                           </div>
                        </div>
                     </div>

                     <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-3 border-t border-white/10 pt-3 relative z-10">
                        <span className="uppercase font-bold tracking-wider">建议采购量:</span>
                        <span className="text-cyber-yellow font-black text-sm">{Math.ceil(eco.reorderQty)} <span className="text-[9px] text-gray-500">pcs</span></span>
                     </div>
                     <button className="w-full py-3 bg-cyber-yellow text-black font-black text-xs hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(252,238,10,0.4)] rounded-lg relative z-10">
                        生成采购单 (¥{eco.capitalRequiredRMB.toLocaleString()})
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
    );

    return createPortal(content, document.body);
  };

  // --- Main List Render ---
  return (
    <div className="px-8 pb-8 space-y-8 animate-in fade-in duration-700">
      <style>{`
        .lbl {
          font-size: 0.6rem;
          color: #86868b;
          text-transform: uppercase;
          font-weight: 800;
          margin-bottom: 0.25rem;
          display: block;
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.1em;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {renderDetailModal()}

      {/* Main Table Header & Tools */}
      <div className="sticky top-0 z-30 bg-black/60 backdrop-blur-xl border-b border-white/10 pb-6 pt-6 -mx-8 px-8 shadow-2xl mb-8 flex flex-col md:flex-row justify-between items-end gap-6 transition-all">
         <div>
            <h1 className="text-4xl font-black text-white tracking-tight text-glow">智能备货中心</h1>
            <p className="text-gray-400 font-medium text-xs mt-2 flex items-center gap-2 tracking-wide">
               <span className="w-2 h-2 rounded-full bg-cyber-blue"></span>
               全球供应链实时汇率: USD/RMB = <span className="text-white font-mono font-bold">{exchangeRate}</span>
            </p>
         </div>
         <div className="flex gap-4">
            {selectedIds.length > 0 ? (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right duration-300">
                    <div className="px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-sm font-bold flex items-center gap-2 backdrop-blur-md">
                        <CheckSquare size={16} />
                        <span>已选 {selectedIds.length} 项</span>
                    </div>
                    <button 
                        onClick={handleBatchDelete}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all flex items-center gap-2 text-sm"
                    >
                        <Trash2 size={16} /> 批量删除
                    </button>
                    <button 
                        onClick={() => setSelectedIds([])}
                        className="px-6 py-2.5 border border-white/20 text-gray-400 hover:text-white hover:border-white rounded-xl text-sm font-bold transition-colors"
                    >
                        取消
                    </button>
                </div>
            ) : (
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyber-cyan transition-colors" size={18} />
                    <input 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="检索 SKU / 追踪号..." 
                        className="bg-white/5 border border-white/10 pl-12 pr-6 py-2.5 text-sm text-white focus:border-cyber-cyan focus:shadow-[0_0_15px_rgba(64,200,224,0.2)] outline-none font-medium w-80 rounded-xl transition-all"
                    />
                </div>
            )}

            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".json" />

            <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl backdrop-blur-md">
                <button
                    onClick={toggleSelectAll}
                    title="全选 / 取消全选"
                    className={`p-2.5 rounded-lg transition-colors ${selectedIds.length > 0 && selectedIds.length === filteredProducts.length ? 'text-cyber-cyan bg-cyber-cyan/20' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                >
                    {selectedIds.length > 0 && selectedIds.length === filteredProducts.length ? <CheckSquare size={18} /> : <Square size={18} />}
                </button>
                <div className="w-[1px] h-5 bg-white/10 mx-1"></div>
                <button 
                    onClick={handleExportData}
                    className="p-2.5 text-gray-400 hover:text-cyber-cyan hover:bg-white/10 rounded-lg transition-colors"
                >
                    <Download size={18} />
                </button>
                <button 
                    onClick={handleImportClick}
                    className="p-2.5 text-gray-400 hover:text-cyber-purple hover:bg-white/10 rounded-lg transition-colors"
                >
                    <Upload size={18} />
                </button>
            </div>

            <button 
                onClick={handleCreateNew}
                className="bg-cyber-cyan text-black px-6 py-2.5 font-bold hover:bg-white transition-all flex items-center gap-2 text-sm shadow-[0_0_20px_rgba(64,200,224,0.4)] rounded-xl uppercase tracking-wide hover:scale-105"
            >
               <Plus size={18} /> 新建产品
            </button>
         </div>
      </div>

      {/* Product Grid List or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 border border-white/10 rounded-3xl bg-white/5 animate-in fade-in backdrop-blur-sm">
           <div className="w-24 h-24 bg-black/50 rounded-full flex items-center justify-center border border-white/10 mb-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
             <Package size={40} className="text-gray-600" />
           </div>
           
           <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
             {searchTerm ? '未找到相关产品' : '数据库暂无记录'}
           </h3>
           <p className="text-gray-500 font-medium text-sm mb-10 text-center max-w-md leading-relaxed">
             {searchTerm 
               ? `系统全域搜索未匹配到包含 "${searchTerm}" 的 SKU 或单号。` 
               : "当前产品库为空。您可以从外部导入 JSON 数据，或新建产品档案。"}
           </p>

           <div className="flex gap-4">
             {searchTerm ? (
               <button 
                 onClick={() => setSearchTerm('')}
                 className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors border border-white/5"
               >
                 清除搜索条件
               </button>
             ) : (
               <>
                 <button 
                    onClick={() => setProducts(initialProducts)}
                    className="px-8 py-3 bg-cyber-cyan/10 border border-cyber-cyan/50 text-cyber-cyan font-bold hover:bg-cyber-cyan hover:text-black transition-all shadow-[0_0_20px_rgba(64,200,224,0.2)] flex items-center gap-2 rounded-xl"
                 >
                    <RefreshCw size={18} /> 恢复演示数据
                 </button>
                 <button 
                    onClick={handleCreateNew}
                    className="px-8 py-3 border border-white/20 text-white font-bold hover:bg-white hover:text-black transition-all flex items-center gap-2 rounded-xl"
                 >
                    <Plus size={18} /> 新建空产品
                 </button>
               </>
             )}
           </div>
        </div>
      ) : (
        <div className="grid gap-5">
           {filteredProducts.map((product) => {
              const eco = calculateEconomics(product);
              const isSelected = selectedIds.includes(product.id);
              
              // Priority Styling
              const priorityMap: any = {
                 'urgent': { label: 'URGENT', class: 'text-red-500 border-red-500/30 bg-red-500/10 animate-pulse' },
                 'normal': { label: 'NORMAL', class: 'text-blue-400 border-blue-400/30 bg-blue-400/10' },
                 'defer': { label: 'DEFER', class: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10' }
              };
              const currentPrio = product.logistics?.priority || 'normal';
              const pStyle = priorityMap[currentPrio] || priorityMap['normal'];

              return (
                 <div 
                   key={product.id} 
                   onClick={() => setSelectedProduct(product)} 
                   className={`apple-glass p-0 cursor-pointer transition-all duration-300 group relative overflow-hidden rounded-2xl ${isSelected ? 'border-cyber-cyan shadow-[0_0_20px_rgba(64,200,224,0.2)] bg-cyber-cyan/5' : 'hover:border-white/30 hover:bg-white/10'}`}
                 >
                    {/* Active Border Indicator */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300 ${isSelected ? 'bg-cyber-cyan shadow-[0_0_10px_#40C8E0]' : 'bg-transparent group-hover:bg-white/30'}`}></div>
                    
                    <div 
                      className="absolute top-5 right-5 z-20"
                      onClick={(e) => toggleSelection(e, product.id)}
                    >
                       <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-cyber-cyan border-cyber-cyan text-black shadow-[0_0_10px_#40C8E0]' : 'bg-black/40 border-gray-600 text-transparent hover:border-white'}`}>
                          <Check size={16} strokeWidth={4} />
                       </div>
                    </div>

                    <div className="p-5 flex gap-6 items-center border-b border-white/5 bg-gradient-to-r from-transparent to-black/20">
                       <div className="w-20 h-20 bg-black/60 border border-white/10 rounded-xl flex-shrink-0 overflow-hidden relative group-hover:border-white/30 transition-colors shadow-lg">
                          {product.image ? <img src={product.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /> : <Package className="m-auto text-gray-700"/>}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                             <div className="text-base font-bold text-white truncate max-w-[400px] tracking-tight group-hover:text-cyber-cyan transition-colors">{product.productName}</div>
                             <div className="flex items-center gap-3 pr-10">
                                <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full border border-white/5">
                                    {product.logistics?.mode === 'air' ? <Plane size={14} className="text-blue-400"/> : <Ship size={14} className="text-blue-600"/>}
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{product.logistics?.mode}</span>
                                </div>

                                <div onClick={e => e.stopPropagation()} className="relative z-10 flex flex-col items-end gap-1">
                                    {/* Editable Priority Label */}
                                    <select
                                        value={currentPrio}
                                        onChange={(e) => handlePriorityUpdate(e, product.id)}
                                        className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border appearance-none text-center outline-none cursor-pointer hover:bg-black transition-all ${pStyle.class}`}
                                    >
                                        <option value="urgent" className="bg-black text-red-500">紧急 (URGENT)</option>
                                        <option value="normal" className="bg-black text-blue-400">正常 (NORMAL)</option>
                                        <option value="defer" className="bg-black text-yellow-500">延后 (DEFER)</option>
                                    </select>
                                    
                                    <select
                                        value={product.logistics?.status || 'Plan'}
                                        onChange={(e) => handleStatusUpdate(e, product.id)}
                                        className={`
                                            appearance-none cursor-pointer text-[10px] font-bold px-3 py-1.5 rounded-full border uppercase tracking-wider outline-none transition-all duration-500 text-center min-w-[80px]
                                            ${product.logistics?.status === 'Received' 
                                                ? 'border-green-500/30 text-green-400 bg-green-500/10' 
                                                : product.logistics?.status === 'Customs'
                                                    ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                                                    : product.logistics?.status === 'Exception'
                                                        ? 'border-red-500/50 text-red-400 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                                                        : product.logistics?.status === 'Shipped'
                                                            ? 'border-blue-500/50 text-blue-400 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                                                            : 'border-white/20 text-gray-400 bg-white/5 hover:border-white/40'
                                            }
                                        `}
                                    >
                                        <option value="Plan" className="bg-[#1c1c1e] text-gray-400">📝 计划中</option>
                                        <option value="Shipped" className="bg-[#1c1c1e] text-blue-400">✈️ 已发货</option>
                                        <option value="Customs" className="bg-[#1c1c1e] text-yellow-400">🛃 清关中</option>
                                        <option value="Received" className="bg-[#1c1c1e] text-green-400">✅ 已入库</option>
                                        <option value="Exception" className="bg-[#1c1c1e] text-red-400">⚠️ 异常延误</option>
                                    </select>
                                </div>
                             </div>
                          </div>
                          
                          <div className="mt-3 flex flex-col gap-2">
                             <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                                <span className="text-white font-bold bg-white/10 px-2 py-1 rounded-md border border-white/10 shadow-inner">{product.skuCode}</span>
                                <span className="flex items-center gap-1.5 text-gray-400"><Warehouse size={14} className="text-cyber-purple"/> {product.logistics?.warehouseDest || 'N/A'}</span>
                             </div>
                             
                             <div className="flex items-center gap-3 text-[11px] font-mono font-medium mt-1">
                                <div className="flex items-center gap-2 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20 text-blue-300">
                                   <FileText size={12}/> 
                                   <span>{product.logistics?.inboundId || 'No Inbound'}</span>
                                </div>
                                <div 
                                  onClick={(e) => handleTrackingClick(e, product.logistics?.trackingNo)}
                                  className="flex items-center gap-2 bg-yellow-500/10 px-2.5 py-1 rounded-md border border-yellow-500/20 text-yellow-300 cursor-pointer hover:bg-yellow-500 hover:text-black transition-all"
                                  title="查询物流"
                                >
                                   <Truck size={12}/> 
                                   <span>{product.logistics?.trackingNo || 'No Tracking'}</span>
                                </div>
                             </div>

                             {/* --- SKU MATRIX MINI VIEW --- */}
                             {product.variants && product.variants.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-white/5">
                                   {product.variants.slice(0, 6).map(v => (
                                      <div key={v.id} className="flex items-center gap-1.5 bg-black/40 border border-white/10 px-2 py-1 rounded text-[10px] font-mono">
                                         <span className="text-cyber-purple font-bold">{v.suffix}</span>
                                         <span className="text-gray-500">|</span>
                                         <span className="text-white">{v.quantity}</span>
                                      </div>
                                   ))}
                                   {product.variants.length > 6 && (
                                      <span className="text-[10px] text-gray-500 self-center px-1">+{product.variants.length - 6} more</span>
                                   )}
                                </div>
                             )}
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-3 divide-x divide-white/5 bg-black/20">
                       <div className="p-4 hover:bg-white/5 transition-colors relative group/stat">
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2">
                             <Package size={12} className="text-cyber-yellow group-hover/stat:scale-110 transition-transform"/> 建议备货
                          </div>
                          <div className="flex items-baseline gap-2">
                             <span className="text-xl font-black text-white">{Math.ceil(eco.reorderQty)}</span>
                             <span className="text-xs text-gray-500 font-bold">pcs</span>
                          </div>
                          <div className="text-xs font-mono text-cyber-yellow mt-1 font-bold">
                             ¥{eco.capitalRequiredRMB.toLocaleString()}
                          </div>
                       </div>

                       <div className="p-4 hover:bg-white/5 transition-colors relative group/stat">
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2">
                             <Plane size={12} className="text-blue-400 group-hover/stat:translate-x-1 transition-transform"/> 头程物流
                          </div>
                          <div className="flex items-baseline gap-2">
                             <span className="text-xl font-black text-white">${eco.totalFreightBatchUSD.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                             <span className="text-xs text-gray-500 font-bold">Total</span>
                          </div>
                          <div className="text-xs font-mono text-blue-400 mt-1 font-bold">
                             ${eco.unitFreightUSD.toFixed(2)} / unit
                          </div>
                       </div>

                       <div className="p-4 hover:bg-white/5 transition-colors relative group/stat">
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2">
                             <Wallet size={12} className="text-cyber-green group-hover/stat:scale-110 transition-transform"/> 预计利润
                          </div>
                          <div className="flex items-baseline gap-2">
                             <span className={`text-xl font-black ${eco.totalProfitBatchUSD > 0 ? 'text-cyber-green text-glow-green' : 'text-cyber-pink'}`}>
                                ${eco.totalProfitBatchUSD.toLocaleString(undefined, {maximumFractionDigits: 0})}
                             </span>
                          </div>
                          <div className="text-xs font-mono text-gray-400 mt-1 flex justify-between font-bold">
                             <span>${eco.netProfit.toFixed(2)}/u</span>
                             <span className={eco.margin > 15 ? "text-cyber-green" : "text-orange-500"}>{eco.margin.toFixed(0)}%</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="px-5 py-2.5 bg-black/40 border-t border-white/5 flex justify-between items-center backdrop-blur-md">
                        <div className="text-[10px] text-gray-500 font-mono font-medium flex items-center gap-2">
                           <Clock size={12} /> 生产周期: <span className="text-white">{product.supplier?.leadTime || 0} 天</span>
                        </div>
                        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                           <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                             <GitFork size={16}/>
                           </button>
                           <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                             <Edit2 size={16}/>
                           </button>
                        </div>
                    </div>
                 </div>
              );
           })}
        </div>
      )}
    </div>
  );
};