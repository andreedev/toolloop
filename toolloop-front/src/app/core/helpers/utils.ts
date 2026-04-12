import { environment } from "../../../enviroments/enviroment";

export class Utils {
    static readonly apiDomain: string = environment.apiDomain;

    static isInt(value: any): boolean {
        return !isNaN(value) &&
            parseInt(value) == value &&
            !isNaN(parseInt(value, 10));
    }

    static shiftAndPopArray(array: any[]): any {
        array.shift();
        array.pop();
        return array;
    }

    static validateNumberIsPositive(number: any): boolean {
        const re2 = /^\d+$/;
        if (re2.test(String(number))) {
            return parseInt(number) > 0;
        }
        return false;
    }

    static sleep = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    static deleteElementFromArray(arr: Array<any>, element: any): Array<any> {
        return arr.filter(e => e != element)
    }

    static deleteElementFromArrayByKey<T>(arr: Array<T>, key: keyof T, value: any): Array<T> {
        return arr.filter(e => e[key] !== value);
    }

    static validateStringIsValid(value: string): boolean {
        return null != value && value != "";
    }

    static validateStringHasMoreLengthThanX(str: string, x: number): boolean {
        return (str.length > x) ? true : false;
    }

    static validateNumberIsGreaterOrEqualThan(number: any, comparator: number): boolean {
        const re2 = /^\d+$/;
        if (re2.test(String(number))) {
            return parseInt(number) >= comparator;
        }
        return false;
    }

    static validateIsEmail(email: string): boolean {
        const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return re.test(String(email).toLowerCase());
    }

    static stringIsEmpty(str: string): boolean {
        return str.length == 0;
    }

    static stringHasLength(str: string, x: number): boolean {
        return (str.length === x) ? true : false;
    }

    static stringHasLessLengthThan(str: string, x: number): boolean {
        return (str.length < x) ? true : false;
    }

    static stringHasMoreLengthThan(str: string, x: number): boolean {
        return (str.length > x) ? true : false;
    }

    static stringHasNumber(myString: string): boolean {
        return /\d/.test(myString);
    }

    static validateNumberIsNegative(number: number): boolean {
        return number < 0;
    }

    static validatePrice(num: number): boolean {
        let regex = /^[1-9]\d*((\.\d{0,2})?)$/;
        return regex.test(String(num));
    }

    static validateNonNegativePrice(num: number) {
        let regex = /^(?:0|[1-9]\d*)((\.\d{0,2})?)$/;
        return regex.test(String(num));
    }


    static validateYear(year: string): boolean {
        let regex = /^[12][0-9]{3}$/;
        return regex.test(year);
    }

    static validatePercentage(value: string): boolean {
        const parsedValue = parseInt(value, 10);
        return !isNaN(parsedValue) && Number.isInteger(parsedValue) && parsedValue >= 1 && parsedValue <= 100;
    }

    static generateHeaders(authenticate: boolean = false): HeadersInit {
        const headers: HeadersInit = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        return headers;
    }

    static generateMultipartHeaders(authenticate: boolean = false): HeadersInit {
        const headers: HeadersInit = {
            'Accept': 'application/json'
        };
        return headers;
    }

    static saveObjectInLocalStorage(key: string, value: any): void {
        localStorage.setItem(key, JSON.stringify(value))
    }

    static getLocalStorageObject(key: string): any {
        const storedArrayString = localStorage.getItem(key)
        if (storedArrayString) return JSON.parse(storedArrayString)
        return null
    }

    static downloadURI(uri: string, name: string) {
        fetch(uri)
            .then(response => response.blob())
            .then(blob => {

                // @ts-ignore
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = name;
                link.click();

                // @ts-ignore
                window.URL.revokeObjectURL(url);
            })
            .catch(console.error);
    }

    static getApiEndpoint(route: any): string {
        return `${this.apiDomain}${route}`;
    }

    static formatDate(rangoFechas: any): any {
        return rangoFechas.format('YYYY-MM-DD');
    }

    static objectExistsInArray<T>(array: T[], obj: Partial<T>, key: keyof T): boolean {
        return array.some(item => item[key] === obj[key]);
    }

    static updateObjectInArray<T>(
        array: T[],
        lookupKey: keyof T,
        lookupValue: any,
        updateKey: keyof T,
        newValue: any
    ): T[] {
        return array.map(item => {
            if (item[lookupKey] === lookupValue) {
                return { ...item, [updateKey]: newValue };
            }
            return item;
        });
    }

    static isAllowedImageFile(file: File | null | undefined): file is File {
        if (!file) return false;
        const type = file.type.toLowerCase();
        return ['image/jpeg', 'image/jpg', 'image/png', 'image/jfif'].includes(type);
    }

    static removeFromArr(arr: any[], value: any) {
        const index = arr.indexOf(value);
        if (index !== undefined && index !== -1) {
            arr.splice(index, 1);
        }
    }

    static removeByAttr(arr: any[], attr: any, value: any) {
        let i = arr.length;
        while (i--) {
            if (arr[i]
                && arr[i].hasOwnProperty(attr)
                && (arguments.length > 2 && arr[i][attr] === value)) {

                arr.splice(i, 1);

            }
        }
        return arr;
    }

    static updateByAttr(arr: any[], attr: string, value: any, updatedAttr: string, updatedValue: any): any[] {
        return arr.map((element) => {
            if (element && element.hasOwnProperty(attr) && element[attr] === value) {
                return { ...element, [updatedAttr]: updatedValue };
            }
            return element;
        });
    }

     static generatePagesUIArray(totalPages: number, page: number): any[] {
        let arr: any = [];
        if (totalPages === 0) {
            arr = ['-'];
        } else if (totalPages === 1) {
            arr = [1];
        } else if (totalPages === 2) {
            arr = [1, 2];
        } else if (totalPages === 3) {
            arr = [1, 2, 3];
        } else if (totalPages === 4) {
            arr = [1, 2, 3, 4];
        } else if (totalPages === 5) {
            arr = [1, 2, 3, 4, 5];
        } else if (totalPages > 5) {
            if (page === 1) {//1
                arr = [1, 2, 3, '...', totalPages];
            } else if (page === 2) {
                arr = [1, 2, 3, '...', totalPages];
            } else if (page == 3) {
                arr = [1, 2, 3, '...', totalPages];
            } else if (page > 3 && page < totalPages - 2) {//x
                arr = [1, '...', page, '...', totalPages];
            } else if (page == totalPages - 2) {
                arr = [1, '...', totalPages - 2, totalPages - 1, totalPages];
            } else if (page == totalPages - 1) {
                arr = [1, '...', totalPages - 2, totalPages - 1, totalPages];
            } else if (page == totalPages) {//n
                arr = [1, '...', totalPages - 2, totalPages - 1, totalPages];
            }
        }
        return arr;
    }

    static parseNumberTo2Decimals(n: number): number {
        return parseFloat(parseFloat(`${n}`).toFixed(2))
    }

    static loadFromLocalStorage(name: string): any {
        const storedCart = localStorage.getItem(name);
        if (storedCart) return JSON.parse(storedCart)
    }

    static updateInLocalStorage(name: string, value: any): void {
        localStorage.setItem(name, JSON.stringify(value));
    }

    static deleteInLocalStorage(name: string): void {
        localStorage.removeItem(name);
    }

    static getByAttr(arr: any[], attr: string, value: any): any {
        return arr.find((element) => element[attr] === value);
    }

    static multiply(a: number, b: number): number {
        if (isNaN(a) || isNaN(b)) {
            throw new Error('Invalid operands. Both operands must be valid numbers.');
        }

        const result = a * b;
        const roundedResult = Math.round(result * 100) / 100; // Round to 2 decimal places
        return roundedResult;
    }

    static divide(a: number, b: number, decimalPlaces: number = 2): number {
        if (isNaN(a) || isNaN(b) || b === 0) {
            throw new Error('Invalid operands. Both operands must be valid numbers and the divisor must not be zero.');
        }

        const result = a / b;
        const roundedResult = Math.round(result * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
        return roundedResult;
    }

    static validateFileHasValidExtension(value: string, extensions: string[]): boolean {
        let ext = value.slice((value.lastIndexOf(".") - 1 >>> 0) + 2);
        ext = ext.toLowerCase();
        return extensions.includes(ext);
    }

    static scrollToTop(): void {
        window.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }

    static validateStringIsValidObjectId(value: string): boolean {
        // 68d46cb29cf8fe3ddee9dd63
        const re2 = /^[a-fA-F0-9]{24}$/;
        return re2.test(value);
    }

    static async copyCurrentUrlToClipboard(): Promise<void> {
        const url = window.location.href;
        await navigator.clipboard.writeText(url);
    }

    static async copySongUrlToClipboard(songId: string): Promise<void> {
        const songUrl = `${window.location.origin}/song/${songId}`;
        await navigator.clipboard.writeText(songUrl);
    }

    static async copyTextToClipboard(text: string) {
        await navigator.clipboard.writeText(text);
    }

    static async readClipboardImageFile(): Promise<File | null> {
        if (!navigator.clipboard?.read) {
            return null;
        }

        try {
            const clipboardItems = await navigator.clipboard.read();

            for (const clipboardItem of clipboardItems) {
                const imageTypes = clipboardItem.types.filter(type => type.startsWith('image/'));
                if (imageTypes.length === 0) continue;

                const priorityType = imageTypes.find(type =>
                    type.includes('jpeg') || type.includes('jfif') || type.includes('jpg')
                ) || imageTypes[0];

                const imageBlob = await clipboardItem.getType(priorityType);
                const imageExtension = this.getImageExtensionFromMimeType(priorityType);

                return new File([imageBlob], `clipboard-cover.${imageExtension}`, { type: priorityType });
            }
        } catch (err) {
            console.error("Failed to read clipboard:", err);
        }

        return null;
    }

    static getImageExtensionFromMimeType(mimeType: string): string {
        switch (mimeType) {
            case 'image/jpeg':
            case 'image/jpg':
            case 'image/jfif':
            case 'image/pjpeg':
                return 'jpg';
            case 'image/gif':
                return 'gif';
            case 'image/png':
                return 'png';
            case 'image/webp':
                return 'webp';
            default:
                return mimeType.split('/')[1] || 'png';
        }
    }
}