export default function Hash(data: any): string {
    let str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        let charCode = str.charCodeAt(i);
        hash = (hash << 5) - hash + charCode;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) + '';
}
