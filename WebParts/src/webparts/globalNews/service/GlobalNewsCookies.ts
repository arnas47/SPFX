import { Data } from "./IGlobalNewsData";

export class GlobalNewsCookies{
    public static getCookie(name: string): Data{
        let data: Data = {
            items: [],
            excluded: [],
            outOfData: true
        };

        document.cookie.split(';').forEach(function (c) {
            var cookieParts = c.split("=");
            if(cookieParts[0] == name){
                data = JSON.parse(cookieParts[1]);
                return data;
            }
        });

        return data;
    }

    public static setCookie(name: string, value: string){
        console.log(name, value);
        document.cookie = `${name}=${value}`;
    }

    public static deleteCookie(name: string){

    }
}