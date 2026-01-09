import PocketBase from 'pocketbase';

// ⚠️ 请将此处替换为您腾讯云服务器的公网 IP 地址和端口 (PocketBase 默认通常是 8090)
// 例如: 'http://123.45.67.89:8090'
export const PB_URL = 'http://YOUR_TENCENT_IP:8090'; 

export const pb = new PocketBase(PB_URL);

// 禁用自动取消请求，防止在快速操作时中断同步
pb.autoCancellation(false);