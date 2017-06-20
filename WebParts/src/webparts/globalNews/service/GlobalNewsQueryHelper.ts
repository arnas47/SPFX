import { IGlobalNewsQuery } from './IGlobalNewsQuery';
import { Item } from './IGlobalNewsData';
import { GlobalNewsConst } from './GlobalNewsConst';

export class GlobalNewsQueryHelper{
    public static makeQueryFilter(filterValue: string): string{ 
        var filter = "";

        if(filterValue){
            filter = "$filter=" + filterValue;
        }

        return filter;
    }

    public static makeQuerySort(orderBy: string, order: string):string{
        var sort = "";

        if(orderBy){
            order = order ? order : "asc";
            sort = `$orderby=${orderBy} ${order}`;
        }
         
        return sort;
    }

    public static makeQueryLimit(limit: number): string{
        var top = "";

        if(limit !== 0){
            top = `$top=${limit}`;
        }
        
        return top;
    }

    public static makeQueryFields(fields: string): string{
        var select = "";

        if(fields){
            select = `$select=${fields}`;
        }

        return select;
    }

    public static makeQuery(request: IGlobalNewsQuery): string{
        var query = request.WebUrl;
        var firstPrperty = true;

        switch(request.Source){
            case "Site Pages" :
                query += `/_api/web/lists/getbytitle('${request.Source}')/items`;
            break;
            case "Open Positions" :
                query += `/_api/web/getfilebyserverrelativeurl('${GlobalNewsConst.rootSiteRelativeUrl}/${request.Source}/${GlobalNewsConst.openPositionsXml}')/$value`;
            break;
        }

        if(request.Filter){
            query += `?${request.Filter}`;
            firstPrperty = true;
        }

        if(request.Sort){
            query += firstPrperty ? "&" : "?";
            query += request.Sort;
        }

        if(request.Limit){
            query += firstPrperty ? "&" : "?";
            query += request.Limit;
        }

        if(request.Fields){
            query += firstPrperty ? "&" : "?";
            query += request.Fields;
        }
 
        return query;
    }

    public static getIdsByDate(prevNews: Item[], lastDate: string): string{
        var ids: string = "";

        for(var i = 0; i < prevNews.length; i++){
            if(prevNews[i].kemiraDateTimeRefinable == lastDate){
                ids += ` and (Id ne ${prevNews[i].Id})`;
            }
        }

        return ids;
    }

    public static getIds(items: Item[], contenTypeId: string[]): string{
        var ids: string = "";

        for(var i = 0; i < items.length; i++){
            if(contenTypeId.indexOf(items[i].ContentTypeId) >= 0){
                ids += ` and (Id ne ${items[i].Id})`;
            }
        }

        return ids;
    }

    public static getIdsArray(items: Item[], contenTypeId: string[]): string[]{
        var ids: string [] = [];

        for(var i = 0; i < items.length; i++){
            if(contenTypeId.indexOf(items[i].ContentTypeId) >= 0){
                ids.push(items[i].Id.toString());
            }
        }

        return ids;
    }
}
