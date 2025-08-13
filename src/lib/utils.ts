import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toWords } from 'number-to-words';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function numberToWords(num: number): string {
    if (num === 0) return 'Zero Taka Only';
    const taka = Math.floor(num);
    const poisha = Math.round((num - taka) * 100);

    let words = toWords(taka)
        .replace(/\b\w/g, char => char.toUpperCase()) + ' Taka';

    if (poisha > 0) {
        words += ' And ' + toWords(poisha).replace(/\b\w/g, char => char.toUpperCase()) + ' Poisha';
    }

    return words + ' Only';
}

export function numberToWordsBn(num: number): string {
    const units = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়'];
    const teens = ['', 'এগারো', 'বারো', 'তেরো', 'চোদ্দ', 'পনেরো', 'ষোল', 'সতেরো', 'আঠারো', 'উনিশ'];
    const tens = ['', 'দশ', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];
    const thousands = ['', 'হাজার', 'লাখ', 'কোটি'];

    const numStr = Math.floor(num).toString();
    if (numStr === '0') return 'শূন্য টাকা মাত্র';
    
    const chunks = [];
    let start = numStr.length;
    
    // কোটি
    if (start > 7) {
        chunks.push(numStr.substring(0, start - 7));
        start -= (start - 7);
    }
    // লাখ
    if (start > 5) {
        chunks.push(numStr.substring(numStr.length - start, numStr.length - 5));
        start = 5;
    }
    // হাজার
    if (start > 3) {
        chunks.push(numStr.substring(numStr.length - start, numStr.length - 3));
        start = 3;
    }
    // শত
    if (start > 2) {
        chunks.push(numStr.substring(numStr.length - start, numStr.length - 2));
        start = 2;
    }
    // দশক
    chunks.push(numStr.substring(numStr.length - start));

    const convert = (nStr: string): string => {
        if (nStr.length > 2) { // শত
            return (units[parseInt(nStr[0])] ? units[parseInt(nStr[0])] + ' শত ' : '') + convert(nStr.substring(1));
        }
        
        const n = parseInt(nStr);
        if (n === 0) return '';
        if (n < 10) return units[n];
        if (n > 10 && n < 20) return teens[n - 10];
        return (tens[Math.floor(n / 10)] || '') + ' ' + (units[n % 10] || '');
    };
    
    let words = '';
    const chunkNames = ['কোটি', 'লাখ', 'হাজার', 'শত', ''];
    const initialChunks = [numStr];
    
    if (numStr.length > 3) {
        initialChunks.pop();
        let tempStr = numStr;
        
        if (tempStr.length > 7) {
            initialChunks.unshift(tempStr.slice(0, -7));
            tempStr = tempStr.slice(-7);
        }
        if (tempStr.length > 5) {
            initialChunks.push(tempStr.slice(0, -5));
            tempStr = tempStr.slice(-5);
        }
        if (tempStr.length > 3) {
            initialChunks.push(tempStr.slice(0, -3));
            tempStr = tempStr.slice(-3);
        }
        initialChunks.push(tempStr);
    }
    
    let result = [];
    const chunkNamesBn = ['কোটি', 'লাখ', 'হাজার'];
    let mainChunks = [];
    let tempNum = numStr;
    
    if(tempNum.length > 3) {
        mainChunks.push(tempNum.slice(-3));
        tempNum = tempNum.slice(0, -3);
        
        while(tempNum.length > 0) {
            mainChunks.push(tempNum.slice(-2));
            tempNum = tempNum.slice(0, -2);
        }
    } else {
        mainChunks.push(tempNum);
    }
    
    mainChunks = mainChunks.reverse();

    for(let i=0; i<mainChunks.length; i++) {
        let chunkVal = parseInt(mainChunks[i]);
        if (chunkVal > 0) {
            let chunkWord = convert(mainChunks[i]).trim();
            if (i < mainChunks.length - 1) { // not last chunk (hundreds)
                result.push(chunkWord + ' ' + chunkNamesBn[mainChunks.length - 2 - i]);
            } else {
                 if (mainChunks.length > 1 && chunkVal < 100) {
                    // handles cases like "এক হাজার এক"
                 }
                result.push(chunkWord);
            }
        }
    }
    
    return result.join(' ').replace(/\s+/g, ' ').trim() + ' টাকা মাত্র';
}
