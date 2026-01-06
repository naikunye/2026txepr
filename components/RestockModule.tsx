import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Package, Edit2, Trash2, Copy, Plane, Ship, Box, ArrowRight, Save, Calculator, Truck, TrendingUp, AlertTriangle, DollarSign, Percent, Scale, Info, Layers, Warehouse, FileText, Anchor, Image as ImageIcon, GitFork, UploadCloud, BarChart4, Wallet, ScanLine, Grid, X, ShieldAlert, Download, Upload, RefreshCw, Link as LinkIcon, CheckSquare, Square, Check } from 'lucide-react';

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

// --- Default Data for Seeding Logistics ---
const defaultLogisticsSeed = [
  { 
    id: '1ZHV2525041299', 
    internalRef: 'LX-240105-01',
    originCode: 'SZX', originCity: '深圳',
    destCode: 'ONT8', destCity: 'Moreno Valley',
    status: 'transport',
    carrier: 'Matson Express',
    mode: 'sea',
    etd: 'Jan 05', eta: 'Jan 22',
    progress: 65,
    skuCount: 1200,
    supplier: { name: 'YiWu BlackRock Outdoor', contact: 'Mr. Wang', phone: '+86 138-0000-0000' },
    packing: { totalCartons: 60, pcsPerCarton: 20, totalWeightKg: 1250, totalVolumeCbm: 4.5 },
    fees: { freightCost: 850, customsDuty: 120, insurance: 50, misc: 30 },
    milestones: [
        { label: '已订舱', date: '01/02', status: 'completed' },
        { label: '已离港', date: '01/05', status: 'completed' },
        { label: '运输中', date: 'Now', status: 'current' },
        { label: '清关中', date: '01/20', status: 'pending' },
        { label: '已送达', date: '01/22', status: 'pending' },
    ]
  },
];

// --- SMART DATA SANITIZATION (Fixes Missing Fields) ---
const sanitizeProduct = (p: any): Product => {
  // Helper to find value in multiple possible paths (Fuzzy Match - Case Insensitive Logic added)
  const getVal = (obj: any, keys: string[], type: 'string'|'number', defaultVal: any) => {
    if (!obj) return defaultVal;
    
    // 1. Try exact matches first
    for (const k of keys) {
      if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') {
        const val = obj[k];
        if (type === 'number') {
            const num = Number(val);
            return isNaN(num) ? defaultVal : num;
        }
        return String(val);
      }
    }
    
    // 2. Try Case-Insensitive matches if strict match failed
    const objKeys = Object.keys(obj);
    for (const k of keys) {
       const lowerK = k.toLowerCase();
       const foundKey = objKeys.find(ok => ok.toLowerCase() === lowerK);
       if (foundKey && obj[foundKey] !== undefined && obj[foundKey] !== null && obj[foundKey] !== '') {
          const val = obj[foundKey];
          if (type === 'number') {
              const num = Number(val);
              return isNaN(num) ? defaultVal : num;
          }
          return String(val);
       }
    }

    return defaultVal;
  };

  // Resolve root-level fallbacks if nested objects are missing
  const root = p || {};
  const sup = root.supplier || {};
  const log = root.logistics || {};
  const fin = root.financials || {};
  const pak = root.packing || {};
  const inv = root.inventory || {};

  // -- Helper for Percentage --
  const getPercent = (obj: any, keys: string[], defaultVal: number) => {
      let val = getVal(obj, keys, 'number', defaultVal);
      // Heuristic: If value > 1, assume it's a whole number (e.g. 15 for 15%), convert to decimal 0.15
      if (val > 1) return val / 100;
      return val;
  };

  // Expanded Aliases for Compatibility
  return {
    id: String(root.id || Date.now() + Math.random()),
    skuCode: getVal(root, ['skuCode', 'sku', 'SKU', 'item_no', 'Product ID', 'Item Number'], 'string', 'UNKNOWN-SKU'),
    productName: getVal(root, ['productName', 'name', 'title', 'desc', 'Product Name', 'Description', '中文名称', '产品名称'], 'string', 'New Product'),
    
    // Image Fix: Added 'thumbnail', 'Photo', 'Picture'
    image: getVal(root, ['image', 'img', 'thumb', 'pic', 'url', 'imageUrl', 'Photo', 'Image', 'Picture', 'thumbnail', '图片', '缩略图'], 'string', ''),
    
    variants: Array.isArray(root.variants) ? root.variants : [],

    supplier: {
      name: getVal(sup, ['name', 'supplierName', 'vendor', 'Supplier', 'Factory', '供应商'], 'string', ''),
      link: getVal(sup, ['link', 'url', '1688', 'Link', '链接'], 'string', ''),
      moq: getVal(sup, ['moq', 'MOQ', '起订量'], 'number', 0),
      
      // COST FIX: Added Chinese aliases
      unitPriceRMB: getVal(sup, ['unitPriceRMB', 'price', 'cost', 'unitCost', 'Purchase Price', 'Cost RMB', 'RMB Cost', 'factory_price', '采购价', '成本', '含税价', '单价', 'RMB', 'cost_price'], 'number', 
                    getVal(root, ['cost', 'purchasePrice', 'Cost', '采购价', '成本', '单价', 'Cost(RMB)'], 'number', 0)), 
      
      leadTime: getVal(sup, ['leadTime', 'productionTime', 'Lead Time', '交期', '生产周期'], 'number', 0),
      paymentTerms: getVal(sup, ['paymentTerms', 'Payment Terms', '付款方式'], 'string', ''),
    },

    logistics: {
      // INBOUND ID FIX: Added Lingxing variants
      inboundId: getVal(log, 
        ['inboundId', 'inboundNo', 'shipmentId', 'lx_id', 'ref_no', 'Reference', 'Inbound ID', 'FBA ID', 'fba_shipment_id', 'shipment_name', 'plan_no', 'local_shipment_id', '入库单号', 'FBA单号'], 
        'string', 
        getVal(root, 
          ['inboundId', 'inboundNo', 'shipmentId', 'lx_id', 'ref_no', 'Reference', 'Inbound ID', 'FBA ID', 'Reference ID', 'Shipment Name', 'fba_shipment_id', 'shipment_name', 'plan_no', '入库单号', 'FBA单号', '单号'], 
          'string', '')
      ),
      
      trackingNo: getVal(log, ['trackingNo', 'tracking', 'trackNo', 'waybill', 'Tracking Number', '追踪号', '运单号'], 'string', 
                  getVal(root, ['Tracking', 'Waybill', '追踪号'], 'string', '')),
      mode: getVal(log, ['mode', 'transportMode', 'Method', '运输方式'], 'string', 'sea') as any,
      warehouseDest: getVal(log, ['warehouseDest', 'warehouse', 'destination', 'Dest', '仓库', '目的仓'], 'string', ''),
      
      unitRateRMB: getVal(log, ['unitRateRMB', 'freight', 'shippingRate', 'headFee', 'Freight Cost', 'Shipping Fee', '头程', '运费单价'], 'number', 
                   getVal(root, ['Freight', 'Shipping', '头程运费'], 'number', 0)),
      dutyRate: getPercent(log, ['dutyRate', 'taxRate', 'Duty', '关税', '税率'], 0),
      hsCode: getVal(log, ['hsCode', 'HS Code', '海关编码'], 'string', ''),
      status: getVal(log, ['status', 'Status', '状态'], 'string', 'Plan') as any,
    },

    packing: {
      // PACKING FIX: Added '装箱数', '箱数', '重量', '体积'
      pcsPerBox: getVal(pak, ['pcsPerBox', 'pcs_per_ctn', 'Pcs/Ctn', '装箱数', '每箱数量', 'Packing', 'Qty/Ctn', 'pcs_per_carton'], 'number', 
                 getVal(root, ['装箱数', '每箱数量', 'Packing', '装箱量'], 'number', 0)),
      
      boxCount: getVal(pak, ['boxCount', 'ctn_count', 'Carton Count', '箱数', '件数', 'CTNS', 'Total Cartons', 'cartons'], 'number', 
                getVal(root, ['箱数', '件数', 'CTNS', '总箱数'], 'number', 0)),
      
      boxWeightKg: getVal(pak, ['boxWeightKg', 'weight', 'Weight (kg)', '重量', '单箱重量', '毛重', 'G.W.', 'G.W', 'gross_weight'], 'number', 
                   getVal(root, ['重量', '单箱重量', '毛重', 'G.W'], 'number', 0)),
      
      boxVolumeCbm: getVal(pak, ['boxVolumeCbm', 'volume', 'cbm', 'CBM', '体积', '单箱体积', 'Meas', 'measurement'], 'number', 
                    getVal(root, ['体积', '单箱体积', 'CBM'], 'number', 0)),
    },

    financials: {
      // SELLING PRICE FIX
      sellingPriceUSD: getVal(fin, ['sellingPriceUSD', 'price', 'sellingPrice', 'tkPrice', 'Selling Price', 'Retail Price', 'USD Price', '售价', '销售价'], 'number', 
                       getVal(root, ['price', 'sellingPrice', 'Price', '售价'], 'number', 0)),
      
      // FEE FIX: Auto-convert percentage (e.g. 15 -> 0.15)
      referralFeeRate: getPercent(fin, ['referralFeeRate', 'commission', 'Platform Fee', '佣金', '平台佣金', 'Fee Rate'], 0),
      
      transactionFeeRate: getPercent(fin, ['transactionFeeRate', '手续费'], 0),
      fixedTransactionFeeUSD: getVal(fin, ['fixedTransactionFeeUSD', '固定费'], 'number', 0),
      affiliateRate: getPercent(fin, ['affiliateRate', 'Affiliate', '达人佣金'], 0),
      fulfillmentFeeUSD: getVal(fin, ['fulfillmentFeeUSD', 'fbaFee', 'Fulfillment', '尾程', '配送费'], 'number', 0),
      outboundHandlingFeeUSD: getVal(fin, ['outboundHandlingFeeUSD', '操作费'], 'number', 0),
      storageFeeUSD: getVal(fin, ['storageFeeUSD', 'Storage', '仓储费'], 'number', 0),
      adCostUSD: getVal(fin, ['adCostUSD', 'cpa', 'Ads', 'Marketing', '广告费', 'CPA'], 'number', 0),
      targetRoas: getVal(fin, ['targetRoas', 'roas', 'ROAS'], 'number', 0),
      returnRate: getPercent(fin, ['returnRate', 'Returns', '退货率'], 0),
      miscCostUSD: getVal(fin, ['miscCostUSD', 'Misc', '杂费'], 'number', 0),
    },
    
    inventory: {
        // QUANTITY FIX: Added '库存', '数量'
        current: getVal(inv, ['current', 'stock', 'qty', 'Stock', 'Quantity', '库存', '现有库存', '数量', 'available'], 'number', 
                 getVal(root, ['库存', '现有库存', '数量', 'Qty', 'Stock'], 'number', 0)),
        incoming: getVal(inv, ['incoming', 'Incoming', '在途', '在途库存'], 'number', 0),
        dailyVelocity: getVal(inv, ['dailyVelocity', 'sales_velocity', 'Velocity', '日销'], 'number', 0),
        safetyDays: getVal(inv, ['safetyDays', 'Safety Days', '安全库存天数'], 'number', 0),
    }
  };
};

export const RestockModule: React.FC = () => {
  // Initialize with Persistence
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('AERO_RESTOCK_DATA');
      return saved ? JSON.parse(saved) : initialProducts;
    } catch (e) {
      return initialProducts;
    }
  });

  // Save on change
  useEffect(() => {
    localStorage.setItem('AERO_RESTOCK_DATA', JSON.stringify(products));
  }, [products]);

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
  const filteredProducts = products.filter(p => 
      p && (
         (p.skuCode || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
         (p.logistics?.inboundId || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // --- Logic Helpers ---
  const handleTrackingClick = (e: React.MouseEvent, trackingNo?: string) => {
    e.stopPropagation();
    if (trackingNo && trackingNo !== '待填追踪号') {
        window.open(`https://www.ups.com/track?loc=zh_CN&tracknum=${trackingNo}`, '_blank');
    }
  };

  // --- Batch Operations ---
  const toggleSelection = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (selectedIds.includes(id)) {
          setSelectedIds(selectedIds.filter(sid => sid !== id));
      } else {
          setSelectedIds([...selectedIds, id]);
      }
  };

  const toggleSelectAll = () => {
      if (selectedIds.length === filteredProducts.length && filteredProducts.length > 0) {
          setSelectedIds([]);
      } else {
          setSelectedIds(filteredProducts.map(p => p.id));
      }
  };

  const handleBatchDelete = () => {
      if (selectedIds.length === 0) return;
      if (confirm(`⚠️ 高危操作确认\n\n您确定要永久删除选中的 ${selectedIds.length} 个 SKU 吗？\n删除后不可恢复。`)) {
          const remaining = products.filter(p => !selectedIds.includes(p.id));
          setProducts(remaining);
          setSelectedIds([]);
          alert("删除成功。");
      }
  };

  // --- SYNC TO LOGISTICS LOGIC ---
  const handleSyncToLogistics = (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    
    // Validation
    if (!p.logistics.trackingNo || p.logistics.trackingNo.trim() === '' || p.logistics.trackingNo.includes('待填')) {
        alert("无法同步：请先在物流信息中填写有效的追踪单号 (Tracking No)。");
        return;
    }

    // Prepare new Shipment object based on Product Data
    const newShipment = {
        id: p.logistics.trackingNo,
        internalRef: p.logistics.inboundId || `AUTO-SYNC-${Date.now().toString().slice(-6)}`,
        originCode: 'CN',
        originCity: p.supplier.name.substring(0, 4) || 'China', // Heuristic for city
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
            freightCost: 0, // Needs calculation or manual entry
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

    // Persistence Logic
    try {
        const storedData = localStorage.getItem('AERO_LOGISTICS_DATA');
        let currentShipments = [];
        
        if (storedData) {
            currentShipments = JSON.parse(storedData);
        } else {
            // Seed with default data so we don't lose the demo experience
            currentShipments = [...defaultLogisticsSeed];
        }

        // Duplicate Check
        const exists = currentShipments.find((s: any) => s.id === newShipment.id);
        if (exists) {
            alert(`同步失败：追踪单号 ${newShipment.id} 已存在于物流模块中。`);
            return;
        }

        // Add new shipment to top
        currentShipments.unshift(newShipment);
        localStorage.setItem('AERO_LOGISTICS_DATA', JSON.stringify(currentShipments));
        
        alert(`✅ 同步成功！\n\n追踪号: ${newShipment.id}\n已自动创建物流追踪档案，请前往[物流追踪]模块查看。`);
    } catch (err) {
        console.error(err);
        alert("同步时发生系统错误 (LocalStorage Error)。");
    }
  };

  // --- Import / Export Handlers ---
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

  // --- Enhanced Helper: Smart Deep Search for Data Array ---
  const findBestDataArray = (obj: any): any[] | null => {
    const candidates: { array: any[], score: number }[] = [];

    const analyzeArray = (arr: any[]) => {
       if (!Array.isArray(arr) || arr.length === 0) return 0;
       let score = 0;
       // Check first few items to estimate quality
       const sample = arr.slice(0, 5); 
       for (const item of sample) {
          if (typeof item === 'object' && item !== null) {
             score += 1; // It's a list of objects
             const keys = Object.keys(item).join(' ').toLowerCase();
             // Bonus for relevant keywords
             if (keys.includes('sku') || keys.includes('name') || keys.includes('title') || keys.includes('id')) score += 5;
             if (keys.includes('price') || keys.includes('cost') || keys.includes('image')) score += 2;
          }
       }
       return score + (arr.length * 0.1); // Tie-breaker: longer arrays preferred slightly
    };

    const traverse = (node: any, depth: number) => {
       if (depth > 5) return; // Prevent stack overflow on massive deeply nested JSONs
       if (typeof node !== 'object' || node === null) return;

       if (Array.isArray(node)) {
          const score = analyzeArray(node);
          if (score > 0) candidates.push({ array: node, score });
          // Don't traverse inside arrays of objects for other arrays, usually data is leaf-ish
          return; 
       }

       for (const key in node) {
          // Special handling for stringified JSON strings
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

    // Sort by score desc
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

        // Intelligent Search for the BEST array
        const targetData = findBestDataArray(json);
        
        if (Array.isArray(targetData) && targetData.length > 0) {
          // Normalize data structure with Smart Mapping
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

  // --- Calculation Engine ---
  const calculateEconomics = (p: Product) => {
    // 1. Sourcing
    const unitProductCostUSD = (p.supplier?.unitPriceRMB || 0) / exchangeRate;
    
    // 2. Logistics (First Leg)
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
    
    // COGS (Landed)
    const landedCostUSD = unitProductCostUSD + unitFreightUSD + unitDutyUSD + (p.financials?.miscCostUSD || 0);

    // 3. Platform Fees
    const sellingPrice = p.financials?.sellingPriceUSD || 0;
    const referralFeeUSD = sellingPrice * (p.financials?.referralFeeRate || 0);
    const transactionFeeUSD = (sellingPrice * (p.financials?.transactionFeeRate || 0)) + (p.financials?.fixedTransactionFeeUSD || 0);
    const affiliateFeeUSD = sellingPrice * (p.financials?.affiliateRate || 0);
    
    // 4. Fulfillment & Hidden Costs (Updated)
    const fulfillmentTotalUSD = (p.financials?.fulfillmentFeeUSD || 0) + (p.financials?.outboundHandlingFeeUSD || 0);
    const storageCostUSD = p.financials?.storageFeeUSD || 0;
    const returnLossUSD = sellingPrice * (p.financials?.returnRate || 0); // Est. Loss from returns

    const totalServiceFees = referralFeeUSD + transactionFeeUSD + affiliateFeeUSD;
    const totalFulfillmentAndStorage = fulfillmentTotalUSD + storageCostUSD;
    
    // 5. Profitability
    // Total Cost = COGS + Service Fees + Fulfillment + Storage + Return Allowance + Ads
    const totalCost = landedCostUSD + totalServiceFees + totalFulfillmentAndStorage + returnLossUSD + (p.financials?.adCostUSD || 0);
    
    const netProfit = sellingPrice - totalCost;
    const margin = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;
    const roi = landedCostUSD > 0 ? (netProfit / landedCostUSD) * 100 : 0; 
    
    // 6. Restock Logic
    const inventory = p.inventory || { current: 0, incoming: 0, dailyVelocity: 0, safetyDays: 0 };
    const supplier = p.supplier || { moq: 0, unitPriceRMB: 0 };
    
    const daysOfCover = inventory.dailyVelocity > 0 ? (inventory.current + inventory.incoming) / inventory.dailyVelocity : 999;
    const needed = Math.max(0, (inventory.safetyDays - daysOfCover) * inventory.dailyVelocity);
    const reorderQty = Math.max(needed, supplier.moq);
    const capitalRequiredRMB = reorderQty * supplier.unitPriceRMB;

    // 7. Batch Totals
    const totalFreightBatchUSD = unitFreightUSD * reorderQty;
    const totalProfitBatchUSD = netProfit * reorderQty;

    return {
      unitProductCostUSD, unitFreightUSD, unitDutyUSD, landedCostUSD,
      referralFeeUSD, transactionFeeUSD, affiliateFeeUSD, 
      fulfillmentTotalUSD, storageCostUSD, returnLossUSD, // New Breakdown metrics
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

  // Quick Clone for Header (Full SPU Copy)
  const handleSkuSplit = () => {
    if (!selectedProduct) return;
    const newSku = {
      ...selectedProduct,
      id: Date.now().toString(),
      skuCode: `${selectedProduct.skuCode}-V2`,
      productName: `${selectedProduct.productName} (Copy)`,
      logistics: { ...selectedProduct.logistics, inboundId: '', trackingNo: '' },
      variants: [] // Clone doesn't carry over specific variants by default
    };
    setProducts([...products, newSku]);
    setSelectedProduct(newSku);
    alert(`SKU 裂变成功！已生成新变体: ${newSku.skuCode}`);
  };

  // Add Variant (Sub-Item)
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
    // Update main list as well
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));

    setVariantSuffix('');
    setVariantName('');
    setVariantQty('');
  };

  // Remove Variant
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
                  {/* Product Thumbnail Upload */}
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
                  
                  {/* Mobile Close Button */}
                  <button onClick={() => setSelectedProduct(null)} className="lg:hidden text-gray-400 hover:text-white">
                      <X size={24} />
                  </button>
               </div>
               
               <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                   {/* SKU Split Button (Legacy / Quick) */}
                   <button 
                     onClick={handleSkuSplit}
                     className="px-4 py-2 bg-purple-900/20 border border-purple-500/50 text-purple-400 font-bold hover:bg-purple-500 hover:text-white transition-colors flex items-center gap-2 text-xs uppercase tracking-wider whitespace-nowrap"
                   >
                      <GitFork size={14} /> 快速复制
                   </button>

                   <div className="h-8 w-[1px] bg-white/10 mx-2 hidden lg:block"></div>

                   <div className="flex items-center gap-2 px-4 py-2 bg-black border border-white/20 rounded whitespace-nowrap">
                      <DollarSign size={14} className="text-gray-400"/>
                      <span className="text-xs text-gray-500 font-mono">USD/RMB:</span>
                      <input 
                        type="number" 
                        value={exchangeRate} 
                        onChange={e => setExchangeRate(parseFloat(e.target.value))}
                        className="w-16 bg-transparent text-white font-bold outline-none text-right font-mono"
                      />
                   </div>
                   <button onClick={() => setSelectedProduct(null)} className="hidden lg:block px-6 py-2 border border-white/20 text-gray-400 hover:text-white hover:border-white transition-colors text-sm font-bold whitespace-nowrap">ESC 关闭</button>
                   <button className="px-6 py-2 bg-cyber-cyan text-black font-bold shadow-neon-cyan hover:bg-white transition-colors flex items-center gap-2 text-sm whitespace-nowrap">
                      <Save size={16} /> 保存
                   </button>
               </div>
            </div>

            {/* 2. Main Content Grid - Responsive Scroll Architecture */}
            <div className="flex-1 overflow-y-auto lg:overflow-hidden grid grid-cols-12 bg-[#0c0c0c]">
               
               {/* LEFT PANEL: TABS & INPUTS */}
               <div className="col-span-12 lg:col-span-8 flex flex-col border-r border-white/10 bg-[#0c0c0c] lg:h-full min-h-0">
                  {/* Tabs */}
                  <div className="flex border-b border-white/10 bg-black/50 sticky top-0 z-10 lg:static overflow-x-auto no-scrollbar">
                     <TabButton id="supply" label="供应链 (Supply)" icon={Layers} />
                     <TabButton id="logistics" label="物流与清关 (Logistics)" icon={Truck} />
                     <TabButton id="finance" label="财务与定价 (Finance)" icon={DollarSign} />
                  </div>

                  {/* Scrollable Content Form */}
                  <div className="p-8 lg:flex-1 lg:overflow-y-auto custom-scrollbar">
                     
                     {/* TAB: SUPPLY CHAIN */}
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
                                   <label className="lbl">起订量 (MOQ)</label>
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
                                   <label className="lbl">1688 / Supplier Link</label>
                                   <input value={selectedProduct.supplier?.link || ''} onChange={e => handleUpdate('supplier.link', e.target.value)} className="input-cyber text-blue-400 cursor-pointer" />
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

                     {/* TAB: LOGISTICS */}
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

                     {/* TAB: FINANCE */}
                     {activeTab === 'finance' && (
                       <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                          {/* ... Finance content ... */}
                          <div className="tech-border p-6 bg-white/5">
                             <h3 className="text-cyber-pink font-bold text-sm uppercase mb-6 flex items-center gap-2">
                                <TrendingUp size={16}/> TikTok 销售定价与费率
                             </h3>
                             
                             {/* Pricing Header */}
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

                             {/* Fee Groups Grid */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                
                                {/* 1. Platform Fees */}
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

                                {/* 2. Fulfillment & Risk (NEW) */}
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
                                <h4 className="text-cyber-purple font-bold text-xs uppercase mb-4">营销与广告 (Marketing)</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                   <div>
                                      <label className="lbl text-cyber-purple">单次广告成本 (CPA/Ads)</label>
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
                        <Scale size={20} className="text-cyber-green"/> 利润瀑布 (Waterfall)
                     </h3>

                     <div className="space-y-3 font-mono text-sm relative">
                        {/* Connecting Line */}
                        <div className="absolute left-[7px] top-2 bottom-8 w-[1px] bg-gray-800"></div>

                        {/* Revenue */}
                        <div className="flex justify-between items-center py-2 border-b border-white/10 relative z-10 bg-[#0F1218]">
                           <span className="text-gray-300 font-bold">销售价格 (Price)</span>
                           <span className="text-white font-bold text-lg">${(selectedProduct.financials?.sellingPriceUSD || 0).toFixed(2)}</span>
                        </div>

                        {/* Deductions */}
                        {[
                          { l: '产品成本', v: eco.unitProductCostUSD, c: 'text-gray-400' },
                          { l: '头程运费', v: eco.unitFreightUSD, c: 'text-gray-400' },
                          { l: '进口关税', v: eco.unitDutyUSD, c: 'text-gray-400' },
                          { l: '平台费率', v: eco.totalServiceFees, c: 'text-red-400' },
                          { l: '履约与操作', v: eco.fulfillmentTotalUSD, c: 'text-blue-400' }, // Includes outbound
                          { l: '仓储与损耗', v: eco.storageCostUSD + eco.returnLossUSD, c: 'text-orange-400' }, // Storage + Returns
                          { l: '广告支出', v: selectedProduct.financials?.adCostUSD || 0, c: 'text-cyber-purple' },
                        ].map((item, i) => (
                          <div key={i} className="flex justify-between text-xs relative pl-4">
                             <div className="absolute left-[5px] top-[6px] w-[5px] h-[5px] rounded-full bg-gray-700"></div>
                             <span className={`${item.c} opacity-80`}>- {item.l}</span>
                             <span className="text-gray-300">${item.v.toFixed(2)}</span>
                          </div>
                        ))}

                        {/* Bottom Line */}
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

                  {/* Smart Actions */}
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