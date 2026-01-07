import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Package, Edit2, Trash2, Copy, Plane, Ship, Box, ArrowRight, Save, Calculator, Truck, TrendingUp, AlertTriangle, DollarSign, Percent, Scale, Info, Layers, Warehouse, FileText, Anchor, Image as ImageIcon, GitFork, UploadCloud, BarChart4, Wallet, ScanLine, Grid, X, ShieldAlert, Download, Upload, RefreshCw, Link as LinkIcon, CheckSquare, Square, Check, AlertCircle, Database } from 'lucide-react';
import { initialShipments } from './LogisticsModule';
import { usePersistence, LOCAL_STORAGE_UPDATE_EVENT } from '../hooks/usePersistence';

// --- World-Class ERP Data Model ---
interface Variant {
  id: string;
  suffix: string;      // e.g., "-BLK"
  variantName: string; // e.g., "Black Color"
  quantity: number;    // e.g., 200
}

interface Product {
  id: string;
  skuCode: string;
  productName: string;
  image: string; // Product Thumbnail URL
  
  variants?: Variant[]; // SUB-SKU Matrix

  // 1. Sourcing & Supply Chain
  supplier: {
    name: string;
    link: string;
    moq: number; // Minimum Order Quantity
    unitPriceRMB: number; // Ex-Factory Price
    leadTime: number; // Days
    paymentTerms: string; // e.g., "30% Deposit, 70% Ship"
  };

  // 2. Logistics & Compliance
  logistics: {
    inboundId: string; // Lingxing / FBA Inbound ID
    trackingNo: string;
    mode: 'air' | 'sea' | 'rail';
    warehouseDest: string; // e.g., "ONT8", "LGB3"
    unitRateRMB: number; // Rate per KG/CBM
    dutyRate: number; // Tax Rate
    hsCode: string; // Customs Code
    status: 'Plan' | 'Shipped' | 'Customs' | 'Received';
  };

  // 3. Packing Specs
  packing: {
    pcsPerBox: number;
    boxCount: number;
    boxWeightKg: number;
    boxVolumeCbm: number;
  };

  // 4. TikTok Financials & Fulfillment
  financials: {
    sellingPriceUSD: number;
    
    // Platform Fees
    referralFeeRate: number;
    transactionFeeRate: number;
    fixedTransactionFeeUSD: number;
    affiliateRate: number;
    
    // Fulfillment & 3PL Costs
    fulfillmentFeeUSD: number;     // FBA/FBT Shipping Fee (Tail-end)
    outboundHandlingFeeUSD: number; // NEW: Overseas Warehouse Pick & Pack / Outbound
    storageFeeUSD: number;          // NEW: Est. Monthly Storage Cost per unit
    
    // Marketing & Risk
    adCostUSD: number; // CPA
    targetRoas: number; // Strategic Goal
    returnRate: number; // NEW: Est. Return Rate % (Cost allowance)
    
    miscCostUSD: number;
  };

  // 5. Inventory Intelligence
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
    variants: [],
    supplier: { name: '义乌市黑岩户外用品', link: '#', moq: 500, unitPriceRMB: 48.5, leadTime: 7, paymentTerms: '30/70' },
    logistics: { inboundId: 'LX-20240105-001', trackingNo: '1ZHV2525041299', mode: 'air', warehouseDest: 'ONT8', unitRateRMB: 38.0, dutyRate: 0.15, hsCode: '6602.00.00', status: 'Shipped' },
    packing: { pcsPerBox: 20, boxCount: 10, boxWeightKg: 12.5, boxVolumeCbm: 0.08 },
    financials: { 
        sellingPriceUSD: 39.99, 
        referralFeeRate: 0.08, 
        transactionFeeRate: 0.029, 
        fixedTransactionFeeUSD: 0.3, 
        affiliateRate: 0.10, 
        fulfillmentFeeUSD: 5.80, 
        outboundHandlingFeeUSD: 1.50, // Added
        storageFeeUSD: 0.20,          // Added
        adCostUSD: 8.00, 
        targetRoas: 3.5, 
        returnRate: 0.05,             // Added (5% returns)
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
    logistics: { inboundId: 'LX-20240108-009', trackingNo: 'MSK99882211', mode: 'sea', warehouseDest: 'LGB3', unitRateRMB: 850, dutyRate: 0.25, hsCode: '8471.60.00', status: 'Plan' },
    packing: { pcsPerBox: 10, boxCount: 50, boxWeightKg: 15.0, boxVolumeCbm: 0.12 },
    financials: { 
        sellingPriceUSD: 69.99, 
        referralFeeRate: 0.08, 
        transactionFeeRate: 0.029, 
        fixedTransactionFeeUSD: 0.3, 
        affiliateRate: 0.15, 
        fulfillmentFeeUSD: 9.20, 
        outboundHandlingFeeUSD: 2.00, // Added
        storageFeeUSD: 0.50,          // Added
        adCostUSD: 15.00, 
        targetRoas: 4.0, 
        returnRate: 0.08,             // Added
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
      dutyRate: fuzzyVal(mixedPool, ['dutyRate', 'taxRate', 'Duty', '关税', '税率'], 'number', 0),
      hsCode: fuzzyVal(mixedPool, ['hsCode', 'HS Code', '海关编码'], 'string', ''),
      status: fuzzyVal(mixedPool, ['status', 'Status', '状态', '物流状态'], 'string', 'Plan') as any,
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

  const handleSyncToLogistics = (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    if (!p.logistics.trackingNo || p.logistics.trackingNo.trim() === '' || p.logistics.trackingNo.includes('待填')) {
        alert("无法同步：请先在物流信息中填写有效的追踪单号 (Tracking No)。");
        return;
    }

    const newShipment = {
        id: p.logistics.trackingNo,
        internalRef: p.logistics.inboundId || `AUTO-SYNC-${Date.now().toString().slice(-6)}`,
        originCode: 'CN',
        originCity: p.supplier.name.substring(0, 4) || 'China', 
        destCode: p.logistics.warehouseDest || 'US',
        destCity: 'Destination',
        status: p.logistics.status === 'Plan' ? 'pending' : 
                p.logistics.status === 'Shipped' ? 'transport' : 
                p.logistics.status === 'Customs' ? 'customs' : 'delivered',
        carrier: p.logistics.mode === 'air' ? 'Air Express' : 'Ocean Line',
        mode: p.logistics.mode,
        etd: '待定',
        eta: '待定',
        progress: p.logistics.status === 'Shipped' ? 20 : 0,
        skuCount: (p.inventory.incoming || 0) + (p.variants?.reduce((s, v) => s + v.quantity, 0) || 0),
        supplier: { 
            name: p.supplier.name, 
            contact: '供应商对接人', 
            phone: '' 
        },
        packing: {
            totalCartons: p.packing.boxCount,
            pcsPerCarton: p.packing.pcsPerBox,
            totalWeightKg: p.packing.boxCount * p.packing.boxWeightKg,
            totalVolumeCbm: p.packing.boxCount * p.packing.boxVolumeCbm
        },
        fees: {
            freightCost: 0,
            customsDuty: 0,
            insurance: 0,
            misc: p.financials.miscCostUSD
        },
        milestones: [
            { label: '系统同步', date: new Date().toLocaleDateString(), status: 'completed' },
            { label: '已发货', date: '-', status: 'pending' },
            { label: '已送达', date: '-', status: 'pending' },
        ]
    };

    try {
        const storedData = localStorage.getItem('AERO_LOGISTICS_DATA');
        let currentShipments = [];
        
        if (storedData) {
            currentShipments = JSON.parse(storedData);
        } else {
            currentShipments = [...initialShipments];
        }

        const exists = currentShipments.find((s: any) => s.id === newShipment.id);
        if (exists) {
            alert(`同步失败：追踪单号 ${newShipment.id} 已存在于物流模块中。`);
            return;
        }

        currentShipments.unshift(newShipment);
        
        const KEY = 'AERO_LOGISTICS_DATA';
        localStorage.setItem(KEY, JSON.stringify(currentShipments));
        window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_UPDATE_EVENT, { detail: { key: KEY } }));
        alert(`✅ 同步成功！\n\n追踪号: ${newShipment.id}\n已自动创建物流追踪档案，请前往[物流追踪]模块查看。`);
    } catch (err) {
        console.error(err);
        alert("同步时发生系统错误 (LocalStorage Error)。");
    }
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
    
    if (mode === 'air') {
       totalFreightRMB = totalWeight * rate; 
    } else {
       totalFreightRMB = totalVolume * rate;
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
          logistics: { inboundId: '', trackingNo: '', mode: 'sea', warehouseDest: '', unitRateRMB: 0, dutyRate: 0, hsCode: '', status: 'Plan' },
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
        className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all flex-shrink-0 ${activeTab === id ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/5' : 'border-transparent text-gray-500 hover:text-white'}`}
      >
        <Icon size={16} /> {label}
      </button>
    );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 p-0 lg:p-4">
         <div className="w-full h-full lg:max-w-[95vw] lg:h-[95vh] bg-[#080808] border border-white/10 flex flex-col shadow-2xl relative overflow-hidden lg:rounded-lg">
            {/* 1. Header Toolbar */}
            <div className="h-auto border-b border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between p-6 bg-[#0a0a0a] gap-4 shrink-0">
               <div className="flex items-center gap-6 w-full lg:w-auto">
                  <div 
                    className="group relative w-16 h-16 bg-black border border-white/20 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:border-cyber-cyan transition-colors shrink-0"
                    onClick={() => {
                        const url = prompt("请输入图片URL:", selectedProduct.image);
                        if (url) handleUpdate('image', url);
                    }}
                  >
                     {selectedProduct.image ? (
                       <img src={selectedProduct.image} alt="Product" className="w-full h-full object-cover" />
                     ) : (
                       <ImageIcon size={24} className="text-gray-600 group-hover:text-cyber-cyan" />
                     )}
                     <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <UploadCloud size={20} className="text-white" />
                     </div>
                  </div>

                  <div className="flex-1 min-w-0">
                     <h2 className="text-white font-bold text-xl leading-tight flex items-center gap-3">
                        <span className="truncate">{selectedProduct.productName}</span>
                        <button 
                            className="text-gray-500 hover:text-white transition-colors shrink-0"
                            onClick={() => {
                                const newName = prompt("请输入新的产品名称:", selectedProduct.productName);
                                if (newName) handleUpdate('productName', newName);
                            }}
                        >
                            <Edit2 size={14}/>
                        </button>
                     </h2>
                     <div className="text-gray-500 text-xs font-mono mt-2 flex gap-4 items-center flex-wrap">
                        <span className="bg-white/10 px-2 py-0.5 rounded text-white border border-white/10">{selectedProduct.skuCode}</span>
                        <span className="text-cyber-cyan border border-cyber-cyan/30 px-2 py-0.5 rounded flex items-center gap-1 bg-cyber-cyan/5">
                           <Warehouse size={10} /> {selectedProduct.logistics?.warehouseDest || 'N/A'}
                        </span>
                     </div>
                  </div>
                  
                  <button onClick={() => setSelectedProduct(null)} className="lg:hidden text-gray-400 hover:text-white">
                      <X size={24} />
                  </button>
               </div>
               
               <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                   <button 
                     onClick={handleSkuSplit}
                     className="px-4 py-2 bg-purple-900/20 border border-purple-500/50 text-purple-400 font-bold hover:bg-purple-500 hover:text-white transition-colors flex items-center gap-2 text-xs uppercase tracking-wider whitespace-nowrap"
                   >
                      <GitFork size={14} /> 快速复制
                   </button>

                   <div className="h-8 w-[1px] bg-white/10 mx-2 hidden lg:block"></div>

                   <div className="flex items-center gap-2 px-4 py-2 bg-black border border-white/20 rounded whitespace-nowrap">
                      <DollarSign size={14} className="text-gray-400"/>
                      <span className="text-xs text-gray-500 font-mono">全球汇率:</span>
                      <input 
                        type="number" 
                        value={exchangeRate} 
                        onChange={e => setExchangeRate(parseFloat(e.target.value))}
                        className="w-16 bg-transparent text-white font-bold outline-none text-right font-mono"
                      />
                   </div>
                   <button onClick={() => setSelectedProduct(null)} className="hidden lg:block px-6 py-2 border border-white/20 text-gray-400 hover:text-white hover:border-white transition-colors text-sm font-bold whitespace-nowrap">ESC 关闭</button>
                   <button 
                      onClick={handleSave}
                      className="px-6 py-2 bg-cyber-cyan text-black font-bold shadow-neon-cyan hover:bg-white transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
                   >
                      <Save size={16} /> 保存
                   </button>
               </div>
            </div>

            {/* 2. Main Content Grid - Responsive Scroll Architecture */}
            <div className="flex-1 overflow-y-auto lg:overflow-hidden grid grid-cols-12 bg-[#0c0c0c]">
               {/* LEFT PANEL */}
               <div className="col-span-12 lg:col-span-8 flex flex-col border-r border-white/10 bg-[#0c0c0c] lg:h-full min-h-0">
                  <div className="flex border-b border-white/10 bg-black/50 sticky top-0 z-10 lg:static overflow-x-auto no-scrollbar">
                     <TabButton id="supply" label="供应链 (Supply)" icon={Layers} />
                     <TabButton id="logistics" label="物流与清关 (Logistics)" icon={Truck} />
                     <TabButton id="finance" label="财务与定价 (Finance)" icon={DollarSign} />
                  </div>

                  <div className="p-8 lg:flex-1 lg:overflow-y-auto custom-scrollbar">
                     {activeTab === 'supply' && (
                       <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                          {/* ... Supply chain content ... */}
                          {/* Section 1: Supplier */}
                          <div className="tech-border p-6 bg-white/5">
                             <h3 className="text-cyber-yellow font-bold text-sm uppercase mb-6 flex items-center gap-2">
                                <Layers size={16}/> 供应商信息
                             </h3>
                             <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                   <label className="lbl">供应商全称</label>
                                   <input value={selectedProduct.supplier?.name || ''} onChange={e => handleUpdate('supplier.name', e.target.value)} className="input-cyber" />
                                </div>
                                <div>
                                   <label className="lbl">采购单价 (RMB)</label>
                                   <input type="number" value={selectedProduct.supplier?.unitPriceRMB || 0} onChange={e => handleUpdate('supplier.unitPriceRMB', parseFloat(e.target.value))} className="input-cyber text-cyber-yellow border-cyber-yellow/30" />
                                </div>
                                <div>
                                   <label className="lbl">备货数量 (MOQ)</label>
                                   <input type="number" value={selectedProduct.supplier?.moq || 0} onChange={e => handleUpdate('supplier.moq', parseFloat(e.target.value))} className="input-cyber" />
                                </div>
                                <div>
                                   <label className="lbl">生产周期 (天)</label>
                                   <input type="number" value={selectedProduct.supplier?.leadTime || 0} onChange={e => handleUpdate('supplier.leadTime', parseFloat(e.target.value))} className="input-cyber" />
                                </div>
                                <div>
                                   <label className="lbl">付款条款 (Payment Terms)</label>
                                   <input value={selectedProduct.supplier?.paymentTerms || ''} onChange={e => handleUpdate('supplier.paymentTerms', e.target.value)} className="input-cyber" placeholder="e.g. 30% Deposit" />
                                </div>
                                <div className="col-span-2">
                                   <label className="lbl">1688 / 采购链接 (Link)</label>
                                   <div className="relative flex items-center">
                                      <input 
                                        value={selectedProduct.supplier?.link || ''} 
                                        onChange={e => handleUpdate('supplier.link', e.target.value)} 
                                        className="input-cyber text-blue-400 cursor-pointer pr-10" 
                                      />
                                      {selectedProduct.supplier?.link && (
                                        <button 
                                          onClick={() => handleUpdate('supplier.link', '')}
                                          className="absolute right-2 text-gray-500 hover:text-white p-1"
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
                          <div className="tech-border p-6 bg-cyber-purple/5 border-cyber-purple/30">
                             <h3 className="text-cyber-purple font-bold text-sm uppercase mb-4 flex items-center gap-2">
                                <Grid size={16}/> 多规格/SKU 矩阵 (SKU Matrix)
                             </h3>
                             <p className="text-gray-500 text-xs mb-4 font-mono">
                                在当前 SPU 下添加新的规格变体（如颜色、尺寸）。变体将共享主商品的物流和供应商信息。
                             </p>
                             
                             {/* Creator Inputs */}
                             <div className="flex flex-col lg:flex-row items-end gap-4 mb-6">
                                <div className="w-full lg:w-1/4">
                                   <label className="lbl text-cyber-purple">SKU 后缀 (Suffix)</label>
                                   <input 
                                      value={variantSuffix}
                                      onChange={e => setVariantSuffix(e.target.value)}
                                      className="input-cyber border-cyber-purple/30 focus:border-cyber-purple focus:shadow-neon-pink" 
                                      placeholder="e.g. -BLK" 
                                   />
                                </div>
                                <div className="w-full lg:flex-1">
                                   <label className="lbl text-cyber-purple">变体名称 (Variant Name)</label>
                                   <input 
                                      value={variantName}
                                      onChange={e => setVariantName(e.target.value)}
                                      className="input-cyber border-cyber-purple/30 focus:border-cyber-purple focus:shadow-neon-pink" 
                                      placeholder="e.g. Classic Black (XL)" 
                                   />
                                </div>
                                <div className="w-full lg:w-24">
                                   <label className="lbl text-cyber-purple">数量 (Qty)</label>
                                   <input 
                                      type="number"
                                      value={variantQty}
                                      onChange={e => setVariantQty(e.target.value)}
                                      className="input-cyber border-cyber-purple/30 focus:border-cyber-purple focus:shadow-neon-pink text-center" 
                                      placeholder="0" 
                                   />
                                </div>
                                <button 
                                   onClick={handleAddVariant}
                                   className="w-full lg:w-auto px-6 py-2.5 bg-cyber-purple text-white font-bold text-sm hover:bg-white hover:text-black transition-all shadow-[0_0_15px_rgba(188,19,254,0.3)] flex items-center justify-center gap-2"
                                >
                                   <Plus size={16} /> 添加
                                </button>
                             </div>

                             {/* Variants Table */}
                             {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                                <div className="border border-white/10 rounded overflow-hidden bg-black/20">
                                   <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                      <table className="w-full text-sm text-left">
                                         <thead className="bg-white/5 text-gray-400 font-mono text-xs uppercase sticky top-0 bg-[#151515] z-10 shadow-sm">
                                            <tr>
                                               <th className="p-3 font-medium">完整 SKU 编码</th>
                                               <th className="p-3 font-medium">变体名称</th>
                                               <th className="p-3 font-medium text-right">数量</th>
                                               <th className="p-3 font-medium text-center">操作</th>
                                            </tr>
                                         </thead>
                                         <tbody className="divide-y divide-white/5">
                                            {selectedProduct.variants.map((v) => (
                                               <tr key={v.id} className="hover:bg-white/5 transition-colors group">
                                                  <td className="p-3 font-mono text-cyber-cyan font-bold">
                                                     {selectedProduct.skuCode}{v.suffix.startsWith('-') ? '' : '-'}{v.suffix}
                                                  </td>
                                                  <td className="p-3 text-gray-300">
                                                     {v.variantName}
                                                  </td>
                                                  <td className="p-3 font-mono text-white text-right">
                                                     {v.quantity}
                                                  </td>
                                                  <td className="p-3 text-center">
                                                     <button 
                                                       onClick={() => handleRemoveVariant(v.id)}
                                                       className="text-gray-600 hover:text-cyber-pink transition-colors p-1"
                                                     >
                                                        <Trash2 size={14} />
                                                     </button>
                                                  </td>
                                               </tr>
                                            ))}
                                         </tbody>
                                      </table>
                                   </div>
                                   <div className="bg-white/5 text-xs font-mono text-gray-500 p-3 flex justify-between border-t border-white/5">
                                      <span>变体总数: {selectedProduct.variants.length}</span>
                                      <span className="text-white font-bold">总数量: {selectedProduct.variants.reduce((sum, v) => sum + v.quantity, 0)}</span>
                                   </div>
                                </div>
                             ) : (
                                <div className="text-center py-8 text-gray-600 text-xs font-mono border border-dashed border-gray-800 rounded">
                                   暂无变体。请在上方添加 SKU 变体。
                                </div>
                             )}
                          </div>

                          {/* Section 3: Packing */}
                          <div className="tech-border p-6 bg-white/5">
                             <h3 className="text-gray-400 font-bold text-sm uppercase mb-6 flex items-center gap-2">
                                <Box size={16}/> 装箱规格 (Packing Specs)
                             </h3>
                             <div className="grid grid-cols-4 gap-6">
                                <div>
                                   <label className="lbl">每箱数量 (Pcs/Box)</label>
                                   <input type="number" value={selectedProduct.packing?.pcsPerBox || 0} onChange={e => handleUpdate('packing.pcsPerBox', parseFloat(e.target.value))} className="input-cyber" />
                                </div>
                                <div>
                                   <label className="lbl">总箱数 (Total Boxes)</label>
                                   <input type="number" value={selectedProduct.packing?.boxCount || 0} onChange={e => handleUpdate('packing.boxCount', parseFloat(e.target.value))} className="input-cyber" />
                                </div>
                                <div>
                                   <label className="lbl">单箱重量 (KG)</label>
                                   <input type="number" value={selectedProduct.packing?.boxWeightKg || 0} onChange={e => handleUpdate('packing.boxWeightKg', parseFloat(e.target.value))} className="input-cyber" />
                                </div>
                                <div>
                                   <label className="lbl">单箱体积 (CBM)</label>
                                   <input type="number" value={selectedProduct.packing?.boxVolumeCbm || 0} onChange={e => handleUpdate('packing.boxVolumeCbm', parseFloat(e.target.value))} className="input-cyber" />
                                </div>
                             </div>
                             <div className="mt-4 p-3 bg-black border border-white/10 flex gap-6 text-xs font-mono text-gray-500">
                                <span>总件数: <span className="text-white">{eco.totalUnits}</span></span>
                                <span>总重量: <span className="text-white">{eco.totalWeight.toFixed(2)} kg</span></span>
                                <span>总体积: <span className="text-white">{eco.totalVolume.toFixed(3)} cbm</span></span>
                             </div>
                          </div>
                       </div>
                     )}

                     {activeTab === 'logistics' && (
                       <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                          <div className="tech-border p-6 bg-white/5">
                             <div className="flex justify-between items-center mb-6">
                                <h3 className="text-cyber-cyan font-bold text-sm uppercase flex items-center gap-2">
                                    <Truck size={16}/> 物流单证信息
                                </h3>
                                <button 
                                    onClick={(e) => handleSyncToLogistics(e, selectedProduct)}
                                    className="px-4 py-2 bg-cyber-cyan/10 border border-cyber-cyan text-cyber-cyan text-xs font-bold hover:bg-cyber-cyan hover:text-black transition-all flex items-center gap-2 rounded shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                                >
                                    <RefreshCw size={14} /> 同步到物流追踪 (Sync)
                                </button>
                             </div>
                             <div className="grid grid-cols-2 gap-6 mb-4">
                                <div>
                                   <label className="lbl flex items-center gap-2 text-cyber-cyan"><FileText size={10} /> 领星/平台入库单号 (Inbound ID)</label>
                                   <input 
                                     value={selectedProduct.logistics?.inboundId || ''} 
                                     onChange={e => handleUpdate('logistics.inboundId', e.target.value)} 
                                     className="input-cyber border-cyber-cyan/30 text-cyber-cyan font-bold"
                                     placeholder="e.g. LX-20240101-001" 
                                   />
                                </div>
                                <div>
                                   <label className="lbl flex items-center gap-2"><Anchor size={10} /> 物流追踪号 (Tracking No)</label>
                                   <div className="flex gap-2">
                                       <input 
                                         value={selectedProduct.logistics?.trackingNo || ''} 
                                         onChange={e => handleUpdate('logistics.trackingNo', e.target.value)} 
                                         className="input-cyber flex-1"
                                         placeholder="e.g. 1Z999..." 
                                       />
                                       <button 
                                         onClick={(e) => handleSyncToLogistics(e, selectedProduct)}
                                         className="px-3 bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/50 hover:bg-cyber-cyan hover:text-black transition-colors"
                                         title="同步"
                                       >
                                           <LinkIcon size={14} />
                                       </button>
                                   </div>
                                </div>
                                <div>
                                   <label className="lbl">目的仓库 (Warehouse)</label>
                                   <input value={selectedProduct.logistics?.warehouseDest || ''} onChange={e => handleUpdate('logistics.warehouseDest', e.target.value)} className="input-cyber" placeholder="e.g. ONT8" />
                                </div>
                                <div>
                                   <label className="lbl">物流状态</label>
                                   <select value={selectedProduct.logistics?.status || 'Plan'} onChange={e => handleUpdate('logistics.status', e.target.value)} className="input-cyber">
                                      <option value="Plan">计划中 (Plan)</option>
                                      <option value="Shipped">已发货 (Shipped)</option>
                                      <option value="Customs">清关中 (Customs)</option>
                                      <option value="Received">已入库 (Received)</option>
                                   </select>
                                </div>
                             </div>
                          </div>

                          <div className="tech-border p-6 bg-white/5">
                             <h3 className="text-gray-400 font-bold text-sm uppercase mb-6 flex items-center gap-2">
                                <Plane size={16}/> 运输与清关成本
                             </h3>
                             <div className="grid grid-cols-3 gap-6">
                                <div>
                                   <label className="lbl">运输方式</label>
                                   <select value={selectedProduct.logistics?.mode || 'sea'} onChange={e => handleUpdate('logistics.mode', e.target.value)} className="input-cyber">
                                      <option value="air">✈️ 空运 (Air)</option>
                                      <option value="sea">🚢 海运 (Sea)</option>
                                      <option value="rail">🚆 铁路 (Rail)</option>
                                   </select>
                                </div>
                                <div>
                                   <label className="lbl">运费单价 ({selectedProduct.logistics?.mode === 'air' ? '¥/KG' : '¥/CBM'})</label>
                                   <input type="number" value={selectedProduct.logistics?.unitRateRMB || 0} onChange={e => handleUpdate('logistics.unitRateRMB', parseFloat(e.target.value))} className="input-cyber" />
                                </div>
                                <div>
                                   <label className="lbl">海关编码 (HS Code)</label>
                                   <input value={selectedProduct.logistics?.hsCode || ''} onChange={e => handleUpdate('logistics.hsCode', e.target.value)} className="input-cyber" />
                                </div>
                                <div>
                                   <label className="lbl">关税税率 (Duty %)</label>
                                   <div className="relative">
                                      <input type="number" value={((selectedProduct.logistics?.dutyRate || 0) * 100).toFixed(2)} onChange={e => handleUpdate('logistics.dutyRate', parseFloat(e.target.value)/100)} className="input-cyber pr-6" />
                                      <span className="absolute right-2 top-2 text-xs text-gray-500">%</span>
                                   </div>
                                </div>
                                <div>
                                   <label className="lbl">杂费预估 (USD/Unit)</label>
                                   <input type="number" value={selectedProduct.financials?.miscCostUSD || 0} onChange={e => handleUpdate('financials.miscCostUSD', parseFloat(e.target.value))} className="input-cyber" />
                                </div>
                             </div>
                          </div>
                       </div>
                     )}

                     {activeTab === 'finance' && (
                       <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                          {/* ... Finance content ... */}
                          <div className="tech-border p-6 bg-white/5">
                             <h3 className="text-cyber-pink font-bold text-sm uppercase mb-6 flex items-center gap-2">
                                <TrendingUp size={16}/> TikTok 销售定价与费率
                             </h3>
                             
                             <div className="mb-6">
                                <label className="text-xs text-cyber-pink font-bold uppercase mb-2 block">TikTok 售价 (Selling Price)</label>
                                <div className="relative">
                                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-xl">$</span>
                                   <input 
                                     type="number" 
                                     value={selectedProduct.financials?.sellingPriceUSD || 0} 
                                     onChange={e => handleUpdate('financials.sellingPriceUSD', parseFloat(e.target.value))} 
                                     className="w-full bg-black border border-cyber-pink/50 text-3xl font-black text-white p-4 pl-10 outline-none focus:shadow-neon-pink focus:border-cyber-pink transition-all font-mono" 
                                   />
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                   <h4 className="text-white text-xs font-bold uppercase border-b border-white/10 pb-2 mb-3">
                                      平台佣金 (Platform Fees)
                                   </h4>
                                   <div className="grid grid-cols-2 gap-4">
                                      <div>
                                         <label className="lbl">平台佣金 (Referral %)</label>
                                         <div className="relative">
                                            <input type="number" value={((selectedProduct.financials?.referralFeeRate || 0) * 100).toFixed(2)} onChange={e => handleUpdate('financials.referralFeeRate', parseFloat(e.target.value)/100)} className="input-cyber pr-6" />
                                            <span className="absolute right-2 top-2 text-xs text-gray-500">%</span>
                                         </div>
                                      </div>
                                      <div>
                                         <label className="lbl">达人佣金 (Affiliate %)</label>
                                         <div className="relative">
                                            <input type="number" value={((selectedProduct.financials?.affiliateRate || 0) * 100).toFixed(0)} onChange={e => handleUpdate('financials.affiliateRate', parseFloat(e.target.value)/100)} className="input-cyber pr-6" />
                                            <span className="absolute right-2 top-2 text-xs text-gray-500">%</span>
                                         </div>
                                      </div>
                                      <div className="col-span-2">
                                         <label className="lbl">交易手续费 (Trans % + Fixed)</label>
                                         <div className="flex gap-2">
                                            <input type="number" value={((selectedProduct.financials?.transactionFeeRate || 0) * 100).toFixed(2)} onChange={e => handleUpdate('financials.transactionFeeRate', parseFloat(e.target.value)/100)} className="input-cyber w-1/2" placeholder="%" />
                                            <input type="number" value={selectedProduct.financials?.fixedTransactionFeeUSD || 0} onChange={e => handleUpdate('financials.fixedTransactionFeeUSD', parseFloat(e.target.value))} className="input-cyber w-1/2" placeholder="$" />
                                         </div>
                                      </div>
                                   </div>
                                </div>

                                <div className="space-y-4">
                                   <h4 className="text-white text-xs font-bold uppercase border-b border-white/10 pb-2 mb-3 flex justify-between">
                                      履约与隐形成本 (Fulfillment & Risk)
                                   </h4>
                                   <div className="grid grid-cols-2 gap-4">
                                      <div>
                                         <label className="lbl">尾程配送 (Fulfillment)</label>
                                         <div className="relative">
                                            <input type="number" value={selectedProduct.financials?.fulfillmentFeeUSD || 0} onChange={e => handleUpdate('financials.fulfillmentFeeUSD', parseFloat(e.target.value))} className="input-cyber pl-6" />
                                            <span className="absolute left-2 top-2 text-xs text-gray-500">$</span>
                                         </div>
                                      </div>
                                      <div>
                                         <label className="lbl text-cyber-yellow">海外仓出库/操作费</label>
                                         <div className="relative">
                                            <input type="number" value={selectedProduct.financials?.outboundHandlingFeeUSD || 0} onChange={e => handleUpdate('financials.outboundHandlingFeeUSD', parseFloat(e.target.value))} className="input-cyber pl-6 border-cyber-yellow/20" />
                                            <span className="absolute left-2 top-2 text-xs text-gray-500">$</span>
                                         </div>
                                      </div>
                                      <div>
                                         <label className="lbl">预估月度仓储费</label>
                                         <div className="relative">
                                            <input type="number" value={selectedProduct.financials?.storageFeeUSD || 0} onChange={e => handleUpdate('financials.storageFeeUSD', parseFloat(e.target.value))} className="input-cyber pl-6" />
                                            <span className="absolute left-2 top-2 text-xs text-gray-500">$</span>
                                         </div>
                                      </div>
                                      <div>
                                         <label className="lbl flex items-center gap-1 text-red-400"><ShieldAlert size={10}/> 退货/损耗预估 %</label>
                                         <div className="relative">
                                            <input type="number" value={((selectedProduct.financials?.returnRate || 0) * 100).toFixed(1)} onChange={e => handleUpdate('financials.returnRate', parseFloat(e.target.value)/100)} className="input-cyber pr-6 text-red-400 border-red-900/30" />
                                            <span className="absolute right-2 top-2 text-xs text-gray-500">%</span>
                                         </div>
                                      </div>
                                   </div>
                                </div>
                             </div>
                             
                             <div className="border-t border-white/5 pt-4 mt-6">
                                <h4 className="text-cyber-purple font-bold text-xs uppercase mb-4">营销推广 (Marketing)</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                   <div>
                                      <label className="lbl text-cyber-purple">单次获客成本 (CPA/Ads)</label>
                                      <input type="number" value={selectedProduct.financials?.adCostUSD || 0} onChange={e => handleUpdate('financials.adCostUSD', parseFloat(e.target.value))} className="input-cyber border-cyber-purple/30 text-cyber-purple font-bold" />
                                   </div>
                                   <div>
                                      <label className="lbl">目标投产比 (Target ROAS)</label>
                                      <input type="number" value={selectedProduct.financials?.targetRoas || 0} onChange={e => handleUpdate('financials.targetRoas', parseFloat(e.target.value))} className="input-cyber" />
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                     )}
                  </div>
               </div>

               {/* RIGHT PANEL: LIVE ANALYTICS (Fixed) */}
               <div className="col-span-12 lg:col-span-4 bg-[#0F1218] p-6 flex flex-col border-l border-white/5 shadow-2xl lg:h-full lg:overflow-y-auto">
                  <div className="mb-6">
                     <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                        <Scale size={20} className="text-cyber-green"/> 利润瀑布 (Profit Waterfall)
                     </h3>

                     <div className="space-y-3 font-mono text-sm relative">
                        <div className="absolute left-[7px] top-2 bottom-8 w-[1px] bg-gray-800"></div>
                        <div className="flex justify-between items-center py-2 border-b border-white/10 relative z-10 bg-[#0F1218]">
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
                          <div key={i} className="flex justify-between text-xs relative pl-4">
                             <div className="absolute left-[5px] top-[6px] w-[5px] h-[5px] rounded-full bg-gray-700"></div>
                             <span className={`${item.c} opacity-80`}>- {item.l}</span>
                             <span className="text-gray-300">${item.v.toFixed(2)}</span>
                          </div>
                        ))}

                        <div className="mt-6 pt-4 border-t-2 border-white/10 bg-white/5 p-4 rounded-lg">
                           <div className="flex justify-between items-center mb-1">
                              <span className="text-white font-bold text-sm uppercase tracking-wider">净利润 (Net Profit)</span>
                              <span className={`text-3xl font-black ${eco.netProfit > 0 ? 'text-cyber-green' : 'text-cyber-pink'}`}>
                                 ${eco.netProfit.toFixed(2)}
                              </span>
                           </div>
                           <div className="flex justify-between gap-4 text-xs font-bold font-mono mt-2">
                              <span className="bg-black/30 px-2 py-1 rounded text-gray-400">利润率: <span className={eco.margin > 15 ? 'text-cyber-green' : 'text-orange-500'}>{eco.margin.toFixed(1)}%</span></span>
                              <span className="bg-black/30 px-2 py-1 rounded text-gray-400">ROI: <span className="text-blue-400">{eco.roi.toFixed(0)}%</span></span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-cyber-panel border border-cyber-cyan/30 p-5 rounded-lg mt-auto">
                     <h4 className="text-cyber-cyan font-bold text-sm mb-4 flex items-center gap-2">
                        <Calculator size={16}/> 智能备货建议
                     </h4>
                     
                     <div className="grid grid-cols-2 gap-4 mb-4 text-xs font-mono">
                        <div className="bg-black p-2 rounded">
                           <div className="text-gray-500 mb-1">安全库存</div>
                           <div className="text-white font-bold">{selectedProduct.inventory?.safetyDays || 0} 天</div>
                        </div>
                        <div className="bg-black p-2 rounded">
                           <div className="text-gray-500 mb-1">当前可售</div>
                           <div className={eco.daysOfCover < (selectedProduct.inventory?.safetyDays || 0) ? "text-cyber-pink font-bold" : "text-white font-bold"}>
                              {eco.daysOfCover.toFixed(0)} 天
                           </div>
                        </div>
                     </div>

                     <div className="flex justify-between text-xs font-mono text-gray-400 mb-4 border-t border-white/10 pt-2">
                        <span>建议采购量:</span>
                        <span className="text-cyber-yellow font-bold text-sm">{Math.ceil(eco.reorderQty)} pcs</span>
                     </div>
                     <button className="w-full py-3 bg-cyber-yellow text-black font-bold text-sm hover:bg-white transition-colors uppercase tracking-widest shadow-[0_0_15px_rgba(252,238,10,0.4)]">
                        生成采购单 (¥{eco.capitalRequiredRMB.toLocaleString()})
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
    );
  };

  // --- Main List Render ---
  return (
    <div className="px-6 pb-6 space-y-6 animate-in fade-in duration-500">
      <style>{`
        .lbl {
          font-size: 0.7rem;
          color: #9CA3AF;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 0.35rem;
          display: block;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.05em;
        }
        .input-cyber {
          width: 100%;
          background-color: #050505;
          border: 1px solid #27272a;
          padding: 0.6rem;
          color: white;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          outline: none;
          transition: all 0.2s;
          border-radius: 2px;
        }
        .input-cyber:focus {
          border-color: #00F0FF;
          box-shadow: 0 0 10px rgba(0, 240, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #000; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>

      {renderDetailModal()}

      {/* Main Table Header & Tools - Fixed height */}
      <div className="sticky top-0 z-30 bg-cyber-bg/95 backdrop-blur-xl border-b border-white/10 pb-6 pt-6 -mx-6 px-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] mb-6 flex flex-col md:flex-row justify-between items-end gap-6">
         <div>
            <h1 className="text-3xl font-black text-white tracking-wider">智能备货中心</h1>
            <p className="text-gray-500 font-mono text-xs mt-2 flex items-center gap-2">
               <Info size={12}/> 全球汇率基准: USD/RMB = {exchangeRate}
            </p>
         </div>
         <div className="flex gap-4">
            {selectedIds.length > 0 ? (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right duration-300">
                    <div className="px-4 py-2 bg-red-900/30 border border-red-500/50 text-red-500 rounded text-sm font-bold flex items-center gap-2">
                        <span>已选 {selectedIds.length} 项</span>
                    </div>
                    <button 
                        onClick={handleBatchDelete}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all flex items-center gap-2 text-sm"
                    >
                        <Trash2 size={16} /> 批量删除
                    </button>
                    <button 
                        onClick={() => setSelectedIds([])}
                        className="px-4 py-2 border border-gray-600 text-gray-400 hover:text-white rounded text-sm font-bold"
                    >
                        取消
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="搜索 SKU, 追踪号, 入库单..." 
                        className="bg-black border border-white/20 pl-10 pr-4 py-2 text-sm text-white focus:border-cyber-cyan outline-none font-mono w-72"
                    />
                </div>
            )}

            <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleFileUpload} 
               className="hidden" 
               accept=".json" 
            />

            <div className="flex items-center gap-2 bg-black border border-white/20 p-1 rounded">
                <button
                    onClick={toggleSelectAll}
                    title="全选 / 取消全选"
                    className={`p-2 rounded transition-colors ${selectedIds.length > 0 && selectedIds.length === filteredProducts.length ? 'text-cyber-cyan bg-cyber-cyan/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                >
                    {selectedIds.length > 0 && selectedIds.length === filteredProducts.length ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
                <div className="w-[1px] h-4 bg-gray-700 mx-1"></div>
                <button 
                    onClick={handleExportData}
                    title="导出数据备份 (Export JSON)"
                    className="p-2 text-gray-400 hover:text-cyber-cyan hover:bg-white/10 rounded transition-colors"
                >
                    <Download size={16} />
                </button>
                <button 
                    onClick={handleImportClick}
                    title="导入数据 (Import JSON)"
                    className="p-2 text-gray-400 hover:text-cyber-purple hover:bg-white/10 rounded transition-colors"
                >
                    <Upload size={16} />
                </button>
            </div>

            <button 
                onClick={handleCreateNew}
                className="bg-cyber-cyan text-black px-5 py-2 font-bold hover:bg-white transition-colors flex items-center gap-2 text-sm shadow-neon-cyan"
            >
               <Plus size={16} /> 新建产品
            </button>
         </div>
      </div>

      {/* Product Grid List or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-white/10 rounded-lg bg-white/5 animate-in fade-in">
           {/* ... Empty state content ... */}
           <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center border border-white/10 mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
             <Package size={32} className="text-gray-600" />
           </div>
           
           <h3 className="text-xl font-bold text-white mb-2">
             {searchTerm ? '未找到相关产品' : '暂无产品数据'}
           </h3>
           <p className="text-gray-500 font-mono text-sm mb-8 text-center max-w-md">
             {searchTerm 
               ? `系统未检索到包含 "${searchTerm}" 的 SKU 或物流单号。` 
               : "数据库当前为空。可能是由于缓存清除或初始化未加载演示数据。"}
           </p>

           <div className="flex gap-4">
             {searchTerm ? (
               <button 
                 onClick={() => setSearchTerm('')}
                 className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded transition-colors"
               >
                 清除搜索条件
               </button>
             ) : (
               <>
                 <button 
                    onClick={() => setProducts(initialProducts)}
                    className="px-6 py-2 bg-cyber-cyan/10 border border-cyber-cyan text-cyber-cyan font-bold hover:bg-cyber-cyan hover:text-black transition-all shadow-neon-cyan flex items-center gap-2"
                 >
                    <RefreshCw size={16} /> 恢复演示数据
                 </button>
                 <button 
                    onClick={handleCreateNew}
                    className="px-6 py-2 border border-white/20 text-white font-bold hover:bg-white hover:text-black transition-all flex items-center gap-2"
                 >
                    <Plus size={16} /> 新建空产品
                 </button>
               </>
             )}
           </div>
        </div>
      ) : (
        <div className="grid gap-4">
           {filteredProducts.map((product) => {
              const eco = calculateEconomics(product);
              const isSelected = selectedIds.includes(product.id);
              return (
                 <div 
                   key={product.id} 
                   onClick={() => setSelectedProduct(product)} 
                   className={`bg-[#0F1218] border p-0 cursor-pointer transition-all group relative overflow-hidden rounded-md shadow-lg ${isSelected ? 'border-cyber-cyan shadow-[0_0_15px_rgba(0,240,255,0.15)]' : 'border-white/5 hover:border-cyber-cyan/50'}`}
                 >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${isSelected ? 'bg-cyber-cyan' : 'bg-gray-800 group-hover:bg-cyber-cyan'}`}></div>
                    
                    <div 
                      className="absolute top-4 right-4 z-20"
                      onClick={(e) => toggleSelection(e, product.id)}
                    >
                       <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-cyber-cyan border-cyber-cyan text-black' : 'bg-black/50 border-gray-500 text-transparent hover:border-white'}`}>
                          <Check size={14} strokeWidth={3} />
                       </div>
                    </div>

                    <div className="p-4 flex gap-5 items-center border-b border-white/5 bg-[#12151b]">
                       <div className="w-16 h-16 bg-black border border-white/10 flex-shrink-0 overflow-hidden relative group-hover:border-cyber-cyan transition-colors">
                          {product.image ? <img src={product.image} className="w-full h-full object-cover" /> : <Package className="m-auto text-gray-600"/>}
                       </div>
                       <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                             <div className="text-sm font-bold text-white truncate max-w-[300px]">{product.productName}</div>
                             <div className="flex items-center gap-2 pr-8">
                                {product.logistics?.mode === 'air' ? <Plane size={12} className="text-blue-400"/> : <Ship size={12} className="text-blue-600"/>}
                                <span className={`text-[10px] px-2 py-0.5 rounded border ${product.logistics?.status === 'Shipped' ? 'border-green-500 text-green-500' : 'border-gray-600 text-gray-500'}`}>
                                   {product.logistics?.status === 'Plan' ? '计划中' : 
                                    product.logistics?.status === 'Shipped' ? '已发货' :
                                    product.logistics?.status === 'Customs' ? '清关中' : '已入库'}
                                </span>
                             </div>
                          </div>
                          
                          <div className="mt-2 flex flex-col gap-1.5">
                             <div className="flex items-center gap-3 text-xs font-mono text-gray-500">
                                <span className="text-cyber-cyan font-bold bg-cyber-cyan/10 px-1.5 py-0.5 rounded border border-cyber-cyan/20">{product.skuCode}</span>
                                <span className="flex items-center gap-1 text-gray-400"><Warehouse size={12}/> {product.logistics?.warehouseDest || 'N/A'}</span>
                             </div>
                             
                             <div className="flex items-center gap-4 text-[11px] font-mono text-gray-400">
                                <div className="flex items-center gap-1.5 bg-blue-900/10 px-2 py-0.5 rounded border border-blue-500/20 text-blue-300">
                                   <FileText size={12}/> 
                                   <span>{product.logistics?.inboundId || '待创建入库单'}</span>
                                </div>
                                <div 
                                  onClick={(e) => handleTrackingClick(e, product.logistics?.trackingNo)}
                                  className="flex items-center gap-1.5 bg-yellow-900/10 px-2 py-0.5 rounded border border-yellow-500/20 text-yellow-300 cursor-pointer hover:bg-yellow-500 hover:text-black transition-all"
                                  title="点击前往 UPS 查询物流"
                                >
                                   <Truck size={12}/> 
                                   <span>{product.logistics?.trackingNo || '待填追踪号'}</span>
                                </div>
                                
                                <div 
                                  onClick={(e) => handleSyncToLogistics(e, product)}
                                  className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-cyber-cyan/30 text-cyber-cyan cursor-pointer hover:bg-cyber-cyan hover:text-black transition-all group/sync"
                                  title="同步到物流追踪模块"
                                >
                                   <RefreshCw size={12} className="group-hover/sync:rotate-180 transition-transform" />
                                   <span className="hidden lg:inline">同步</span>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-3 divide-x divide-white/5 bg-black/40">
                       <div className="p-3 hover:bg-white/5 transition-colors">
                          <div className="text-[10px] text-gray-500 uppercase font-mono mb-1 flex items-center gap-1">
                             <Package size={10} className="text-cyber-yellow"/> 建议备货 (Plan)
                          </div>
                          <div className="flex items-baseline gap-2">
                             <span className="text-lg font-bold text-white">{Math.ceil(eco.reorderQty)}</span>
                             <span className="text-xs text-gray-500">pcs</span>
                          </div>
                          <div className="text-xs font-mono text-cyber-yellow mt-1">
                             ¥{eco.capitalRequiredRMB.toLocaleString()} <span className="text-gray-600 opacity-50">所需资金</span>
                          </div>
                       </div>

                       <div className="p-3 hover:bg-white/5 transition-colors">
                          <div className="text-[10px] text-gray-500 uppercase font-mono mb-1 flex items-center gap-1">
                             <Plane size={10} className="text-blue-400"/> 头程物流 (Freight)
                          </div>
                          <div className="flex items-baseline gap-2">
                             <span className="text-lg font-bold text-white">${eco.totalFreightBatchUSD.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                             <span className="text-xs text-gray-500">总计</span>
                          </div>
                          <div className="text-xs font-mono text-blue-400 mt-1">
                             ${eco.unitFreightUSD.toFixed(2)} <span className="text-gray-600 opacity-50">/ 件</span>
                          </div>
                       </div>

                       <div className="p-3 hover:bg-white/5 transition-colors">
                          <div className="text-[10px] text-gray-500 uppercase font-mono mb-1 flex items-center gap-1">
                             <Wallet size={10} className="text-cyber-green"/> 预计利润 (Profit)
                          </div>
                          <div className="flex items-baseline gap-2">
                             <span className={`text-lg font-bold ${eco.totalProfitBatchUSD > 0 ? 'text-cyber-green' : 'text-cyber-pink'}`}>
                                ${eco.totalProfitBatchUSD.toLocaleString(undefined, {maximumFractionDigits: 0})}
                             </span>
                             <span className="text-xs text-gray-500">总计</span>
                          </div>
                          <div className="text-xs font-mono text-gray-400 mt-1 flex justify-between">
                             <span>${eco.netProfit.toFixed(2)}/件</span>
                             <span className={eco.margin > 15 ? "text-cyber-green" : "text-orange-500"}>{eco.margin.toFixed(0)}%</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="px-4 py-2 bg-[#0c0c0c] border-t border-white/5 flex justify-between items-center">
                        <div className="text-[10px] text-gray-600 font-mono">
                           生产周期: {product.supplier?.leadTime || 0} 天
                        </div>
                        <div className="flex gap-2 pr-8">
                           <button className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors">
                             <GitFork size={14}/>
                           </button>
                           <button className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors">
                             <Edit2 size={14}/>
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