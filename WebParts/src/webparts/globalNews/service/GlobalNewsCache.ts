import { Data } from "./IGlobalNewsData";

export class GlobalNewsCache{
    public static getStorageItem(name: string): Data{
        let data: Data = {
            items: [],
            excluded: [],
            outOfData: true
        };

        if (typeof(Storage) !== "undefined") {
            data = JSON.parse(localStorage.getItem(name));
        }
        
        return data;
    }

    public static setStorageItem(name: string, value: string){
        if (typeof(Storage) !== "undefined") {
            var storage = window.localStorage;
            storage.setItem(name, value);
        }
    }

    public static deleteCookie(name: string){

    }
}