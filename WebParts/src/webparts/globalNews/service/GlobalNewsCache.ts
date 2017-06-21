import { Data } from "./IGlobalNewsData";

export class GlobalNewsCache{
    public static getStorageItem(name: string): Data{
        let data: Data = {
            items: [],
            excluded: [],
            outOfData: true
        };

        if (typeof(Storage) !== "undefined") {
            var tempData: Data = JSON.parse(localStorage.getItem(name));
            data = tempData != null ? tempData : data; 
        }
        
        return data;
    }

    public static setStorageItem(name: string, value: Data){
        if (typeof(Storage) !== "undefined") {
            var jsonValue: string = JSON.stringify(value);
            localStorage.setItem(name, jsonValue);
        }
    }

    public static deleteStorageItem(name: string){
        if (typeof(Storage) !== "undefined") {
            localStorage.removeItem(name);
        }
    }
}