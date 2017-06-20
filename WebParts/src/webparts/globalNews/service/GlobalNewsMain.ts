import { AllData, Data } from './IGlobalNewsData';
import { IGlobalNewsMain } from './IGlobalNewsMain';
import { GlobalNewsConst } from './GlobalNewsConst';
import { GlobalNewsService } from './GlobalNewsService';

export class GlobalNewsMain implements IGlobalNewsMain{
    private rowLimit: number;

    constructor(rowLimit: number){
        this.rowLimit = rowLimit;
    }

    // Get data on load
    public loadData(index: number, siteUrl: string): Promise<Data>{
        let service: GlobalNewsService = new GlobalNewsService(this.rowLimit);
        
        switch(index){
            case 0 :
                // Latestnews
                return service.loadLatestNewsData(siteUrl);
            case 1 :
                // News
                return service.loadOtherNewsData(siteUrl + GlobalNewsConst.newsSiteRelativeUrl, GlobalNewsConst.newsContentTypeId);    
            case 2 :
                // Stock & press release
                return service.loadOtherNewsData(siteUrl + GlobalNewsConst.spnSiteRelativeUrl, GlobalNewsConst.spnContentTypeId);
            case 3 :
                // Open positions
                return service.loadOpenPositionsData(siteUrl, GlobalNewsConst.opContentTypeId);
            case 4 :
                // Appointments
                return service.loadOtherNewsData(siteUrl + GlobalNewsConst.newsSiteRelativeUrl, GlobalNewsConst.appointmentContentTypeId);
            case 5 :
                // Blogs
                return service.loadOtherNewsData(siteUrl + GlobalNewsConst.newsSiteRelativeUrl, GlobalNewsConst.blogContentTypeId);                       
        }
        
        return null; 
    }

    // Get data on click "load more"
    public loadMoreData(index: number, prevAllData: AllData, siteUrl: string): Promise<Data>{         
        let service: GlobalNewsService = new GlobalNewsService(this.rowLimit);

        switch(index){
            case 0 :
                // Latest news
                return service.loadMoreLatestNewsData(prevAllData, siteUrl);
            case 1 :          
                // News   
                return service.loadMoreOtherNewsData(prevAllData.news, siteUrl + GlobalNewsConst.newsSiteRelativeUrl, GlobalNewsConst.newsContentTypeId);
            case 2 :
                // Stock & press release
                return service.loadMoreOtherNewsData(prevAllData.spn, siteUrl + GlobalNewsConst.spnSiteRelativeUrl, GlobalNewsConst.spnContentTypeId);
            case 3 :
                // Open positions
                return service.loadMoreOpenPositionsData(prevAllData.openPositions, siteUrl, GlobalNewsConst.opContentTypeId); 
            case 4 :
                // Appointments
                return service.loadMoreOtherNewsData(prevAllData.appointments, siteUrl + GlobalNewsConst.newsSiteRelativeUrl, GlobalNewsConst.appointmentContentTypeId);
            case 5 :
                // Blogs
                return service.loadMoreOtherNewsData(prevAllData.blogs, siteUrl + GlobalNewsConst.newsSiteRelativeUrl, GlobalNewsConst.blogContentTypeId);       
        }
        
        return null;
    }
}