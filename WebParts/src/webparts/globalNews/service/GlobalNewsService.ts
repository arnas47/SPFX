import { GlobalNewsAPI } from './GlobalNewsAPI';
import { GlobalNewsQueryHelper } from './GlobalNewsQueryHelper';
import { GlobalNewsConst } from './GlobalNewsConst';
import { Item, Image, Data, AllData } from './IGlobalNewsData';
import { IGlobalNewsQuery } from './IGlobalNewsQuery';

export class GlobalNewsService{
    private rowLimit: number;

    constructor(rowLimit: number){
        this.rowLimit = rowLimit;
    }

    // Load latest news data combined from news, spn and OpenPositions.xml
    public loadLatestNewsData(siteUrl: string): Promise<Data>{
        var latestNewsFilterValue = `(ContentTypeId eq '${GlobalNewsConst.newsContentTypeId}') or 
            (ContentTypeId eq '${GlobalNewsConst.appointmentContentTypeId}') or 
            (ContentTypeId eq '${GlobalNewsConst.blogContentTypeId}')`;
        
        var spnFilterValue = `(ContentTypeId eq '${GlobalNewsConst.spnContentTypeId}')`; 
        var opFilterValue = `(Title eq '${GlobalNewsConst.openPositionsXml}')`;

        return Promise.all([
            this.getSitePages(siteUrl + GlobalNewsConst.newsSiteRelativeUrl, latestNewsFilterValue),
            this.getSitePages(siteUrl + GlobalNewsConst.spnSiteRelativeUrl, spnFilterValue),
            this.getOpenPositions(siteUrl),
        ])
        .then(response => {
            let newsAppointmentsBlogs: Item[] = response[0]; // get "news", "appointments", "blogs" pages
            let spn: Item[] = response[1]; // get "stock and press release" pages
            let openPositions: Item[] = response[2]; // open positions

            // merge all pages to one array
            let latestNews: Item[] = newsAppointmentsBlogs.concat(spn);
            latestNews = latestNews.concat(openPositions);
                  
            let ofd: boolean =  this.chechIfMoreRecordsExist(latestNews);
          
            // sort by kemiraDateTimeRefinable date
            latestNews.sort(this.sortByDate);
            latestNews = latestNews.splice(0, this.rowLimit); // take top 5 pages
            let lastDate = latestNews[latestNews.length - 1].kemiraDateTimeRefinable;

            let data: Data = {
                items: latestNews,
                excluded: this.itemsToExclude(lastDate, latestNews, [
                    GlobalNewsConst.newsContentTypeId, 
                    GlobalNewsConst.appointmentContentTypeId, 
                    GlobalNewsConst.blogContentTypeId, 
                    GlobalNewsConst.spnContentTypeId,
                    GlobalNewsConst.opContentTypeId]),
                outOfData: ofd
            };

            return data;
        });
    }

    // Load each news type separately
    public loadOtherNewsData(siteUrl: string, contentTypeId: string): Promise<Data>{
        var filterValue = `(ContentTypeId eq '${contentTypeId}')`;  

        return this.getSitePages(siteUrl, filterValue)
        .then((response: Item[]) => {
            let items: Item[] = response;
            let ofd: boolean = this.chechIfMoreRecordsExist(items);
            items.sort(this.sortByDate);
            items = items.splice(0, this.rowLimit);
            let lastDate = items[items.length - 1].kemiraDateTimeRefinable;
            
            let data: Data = {
                items: items,
                excluded: this.itemsToExclude(lastDate, items, [contentTypeId]),
                outOfData: ofd
            };

            return data;  
        }); 
    }

    // Load open positions
    public loadOpenPositionsData(siteUrl: string, contentTypeId: string): Promise<Data>{     
        return this.getOpenPositions(siteUrl)
        .then((response: Item[]) => {
            let items: Item[] = response;
            let ofd: boolean =  this.chechIfMoreRecordsExist(items);
            items.sort(this.sortByDate);
            items = items.splice(0, this.rowLimit);
            var lastDate = items[items.length - 1].kemiraDateTimeRefinable;
            
            let data: Data = {
                items: items,
                excluded: this.itemsToExclude(lastDate, items, [contentTypeId]),
                outOfData: ofd
            };

            return data;  
        }); 
    }

    // Load more latest news
    public loadMoreLatestNewsData(prevAllData: AllData, siteUrl: string): Promise<Data>{
        var latestDate: string = prevAllData.latestNews.items[prevAllData.latestNews.items.length - 1].kemiraDateTimeRefinable;
        var newsBlogsAppIds: string = GlobalNewsQueryHelper.getIds(prevAllData.latestNews.excluded, [
            GlobalNewsConst.newsContentTypeId, 
            GlobalNewsConst.appointmentContentTypeId, 
            GlobalNewsConst.blogContentTypeId]);

        var spnIds: string = GlobalNewsQueryHelper.getIds(prevAllData.latestNews.excluded, [GlobalNewsConst.spnContentTypeId]);
        var opIds: string[] = GlobalNewsQueryHelper.getIdsArray(prevAllData.latestNews.excluded, [GlobalNewsConst.opContentTypeId]);
        
        var latestNewsFilterValue = `((ContentTypeId eq '${GlobalNewsConst.newsContentTypeId}') or 
            (ContentTypeId eq '${GlobalNewsConst.appointmentContentTypeId}') or 
            (ContentTypeId eq '${GlobalNewsConst.blogContentTypeId}')) and 
            (kemiraDateTimeRefinable le '${latestDate}')${newsBlogsAppIds}`;
      
        var spnFilterValue = `(ContentTypeId eq '${GlobalNewsConst.spnContentTypeId}') and 
            (kemiraDateTimeRefinable le '${latestDate}')${spnIds}`; 

        return Promise.all([
            this.getSitePages(siteUrl + GlobalNewsConst.newsSiteRelativeUrl, latestNewsFilterValue),
            this.getSitePages(siteUrl + GlobalNewsConst.spnSiteRelativeUrl, spnFilterValue),
            this.getOpenPositions(siteUrl, latestDate, opIds)
        ])
        .then(response => {
            let newsAppointmentsBlogs: Item[] = response[0]; // get "news", "appointments", "blogs" pages
            let spn: Item[] = response[1]; // get "stock and press release" pages
            let openPositions: Item[] = response[2]; // get "open positions"
                   
            // merge all pages to one array
            let latestNews: Item[] = newsAppointmentsBlogs.concat(spn);
            latestNews = latestNews.concat(openPositions);
   
            let ofd: boolean =  this.chechIfMoreRecordsExist(latestNews);

            // sort by kemiraDateTimeRefinable date
            latestNews.sort(this.sortByDate);
            latestNews = latestNews.splice(0, this.rowLimit); // take top 5 pages
            var lastDate = latestNews[latestNews.length - 1].kemiraDateTimeRefinable;

            let data: Data = {
                items: prevAllData.latestNews.items.concat(latestNews),
                excluded: this.itemsToExclude(lastDate, latestNews, [
                    GlobalNewsConst.newsContentTypeId, 
                    GlobalNewsConst.appointmentContentTypeId, 
                    GlobalNewsConst.blogContentTypeId,
                    GlobalNewsConst.spnContentTypeId,
                    GlobalNewsConst.opContentTypeId]),
                outOfData: ofd
            };

            return data;
        });
    }

    // Load more news by content type
    public loadMoreOtherNewsData(prevData: Data, siteUrl: string, contentTypeId: string): Promise<Data>{
        var latestDate = prevData.items[prevData.items.length - 1].kemiraDateTimeRefinable;
        var ids: string = GlobalNewsQueryHelper.getIdsByDate(prevData.excluded, latestDate);
        var filterValue = `(ContentTypeId eq '${contentTypeId}') and (kemiraDateTimeRefinable le '${latestDate}')${ids}`; 
    
        return this.getSitePages(siteUrl, filterValue)
        .then(response => {
            let items: Item[] = response;
            let ofd: boolean =  this.chechIfMoreRecordsExist(items);
            items.sort(this.sortByDate);
            items = items.splice(0, this.rowLimit);
            var lastDate = items[items.length - 1].kemiraDateTimeRefinable;
            
            let data: Data = {
                items: prevData.items.concat(items),
                excluded: this.itemsToExclude(lastDate, items, [contentTypeId]),
                outOfData: ofd
            };

            return data;  
        });    
    }
    
    // Load more open positions
    public loadMoreOpenPositionsData(prevData: Data, siteUrl: string, contentTypeId: string): Promise<Data>{
        var latestDate = prevData.items[prevData.items.length - 1].kemiraDateTimeRefinable;
        var opIds: string[] = GlobalNewsQueryHelper.getIdsArray(prevData.excluded, [GlobalNewsConst.opContentTypeId]);

        return this.getOpenPositions(siteUrl, latestDate, opIds)
        .then(response => {
            let items: Item[] = response;
            let ofd: boolean =  this.chechIfMoreRecordsExist(items);
            items.sort(this.sortByDate);    
            items = items.splice(0, this.rowLimit);
            var lastDate = items[items.length - 1].kemiraDateTimeRefinable;

            let data: Data = {
                items: prevData.items.concat(items),
                excluded: this.itemsToExclude(lastDate, items, [contentTypeId]),
                outOfData: ofd
            };

            return data;
        });
    }


    // Get article pages from Site Pages library
    public getSitePages(webRelativeUrl: string, filterValue: string): Promise<Item[]> {
        var request: IGlobalNewsQuery;

        request = {
            WebUrl: webRelativeUrl,
            Source: "Site Pages",
            Filter: GlobalNewsQueryHelper.makeQueryFilter(filterValue),
            Sort: GlobalNewsQueryHelper.makeQuerySort("kemiraDateTimeRefinable", "desc"),
            Limit: GlobalNewsQueryHelper.makeQueryLimit(this.rowLimit + 1),
            Fields: GlobalNewsQueryHelper.makeQueryFields("Id,Title,kemiraDateTimeRefinable,BannerImageUrl,ContentTypeId,kemiraNewsIngress,FileRef"),
        };

        var query = GlobalNewsQueryHelper.makeQuery(request);

        return GlobalNewsAPI.xhrRequest(query).then(response => {
            var responseJson = JSON.parse(response.toString());
            return responseJson.value;
        }, 
        (error: any): void => {
            console.log(`Error occured while getting sites pages: ${error.message}`);
            return null;
        });
    }

    // Get open position XML file from Open Position library 
    public getOpenPositions(webRelativeUrl: string, dateFilterValue: string = "", idsFilterValue: string[] = []): Promise<Item[]>{  
        var request: IGlobalNewsQuery;

        request = {
            WebUrl: webRelativeUrl,
            Source: GlobalNewsConst.opLibrary,
            Filter: "",
            Sort: "",
            Limit: "",
            Fields: GlobalNewsQueryHelper.makeQueryFields(""),
        };

        var query = GlobalNewsQueryHelper.makeQuery(request);

        return GlobalNewsAPI.xhrRequest(query).then((response: string) => {
            return this.readOpenPositionsXML(response, webRelativeUrl, dateFilterValue, idsFilterValue);
        }, 
        (error: any): void => {
            console.log(`Error occured while getting xml data: ${error.message}`);
            return null;
        });
    }

    // Sort items by article date
    public sortByDate(a, b): number {
        if (a.kemiraDateTimeRefinable > b.kemiraDateTimeRefinable) {
            return -1;
        }

        if (a.kemiraDateTimeRefinable < b.kemiraDateTimeRefinable) {
            return 1;
        }

        return 0;
    }

    // Check if any more items can be loaded. 
    // true: show Read more link
    // false: hide Read more link
    public chechIfMoreRecordsExist(items: Item[]): boolean{
        return items.length < (this.rowLimit + 1) ? true : false;
    }

    // Exclude items that are already loaded in web part
    public itemsToExclude(lastDate: string, items: Item[], contentTypeIds: string[]): Item[]{
        var excludedItems: Item[] = [];

        for(var i = 0; i < items.length; i++){
            if(items[i].kemiraDateTimeRefinable == lastDate && contentTypeIds.indexOf(items[i].ContentTypeId) >= 0){
                excludedItems.push(items[i]);
            }
        }
        
        return excludedItems;
    }

    // Get data from open position XML file
    private readOpenPositionsXML(xmlText: string, webRelativeUrl: string, dateFilterValue: string = "", idsFilterValue: string[] = []): Item[]{
        let openPositions: Item[] = [];
        xmlText = xmlText.replace(/\s{2,}/g, '').replace(/\\t\\n\\r/g, '');
        var jobsReg = /<job>([\s\S]*?)<\/job>/gi;
        var idReg = /<id>([\s\S]*?)<\/id>/g;
        var startDateReg = /<startdate>([\s\S]*?)<\/startdate>/g;
        var linkReg = /<link>([\s\S]*?)<\/link>/g;
        var titleReg = /<title>([\s\S]*?)<\/title>/g;
        var bodyReg = /<body>([\s\S]*?)<\/body>/g;
        var jobs;

        var image: Image = {
            Url: GlobalNewsConst.openPositionsDefaultImage
        }; 
        
        var latestDate = new Date(dateFilterValue);
        var latestDateTicks = ((latestDate.getTime() * 10000) + 621355968000000000);
        var match;    
  
        while (match = jobsReg.exec(xmlText)) 
        { 
            var job = match[1].replace(/<!\[CDATA\[/g,'').replace(/\]\]>/g,''); 
            var startDateParts = job.match(startDateReg)[0].replace(/<\/?[^>]+(>|$)/g, "").split('/');    
            var startDate = new Date(startDateParts[2], startDateParts[1]-1, startDateParts[0]);
            var startDateTicks = ((startDate.getTime() * 10000) + 621355968000000000);
            var id = job.match(idReg)[0].replace(/<\/?[^>]+(>|$)/g, "");

            if(!dateFilterValue || (dateFilterValue && startDateTicks <= latestDateTicks && idsFilterValue.indexOf(id) === -1)){
                var link = job.match(linkReg)[0].replace(/<\/?[^>]+(>|$)/g, "");
                var title = job.match(titleReg)[0].replace(/<\/?[^>]+(>|$)/g, "");
                var body = this.decodeHTMLEntities(job.match(bodyReg)[0].replace(/<\/?[^>]+(>|$)/g, "")).replace(/.{100}\S*\s+/g, "$&@").split(/\s+@/)[0];
            
                var item: Item = {
                    Id: parseInt(id),
                    Title: title,
                    FileRef: link,
                    kemiraDateTimeRefinable: startDate.toISOString(),
                    kemiraNewsIngress: body,
                    BannerImageUrl: image,
                    ContentTypeId: GlobalNewsConst.opContentTypeId
                };

                openPositions.push(item); 
            }
        }

        return openPositions;
    }

    // Decode encoded symbols
    private decodeHTMLEntities(str: string): string {
      var map = {"'": "&apos;",     "<": "&lt;",        ">": "&gt;",        " ": "&nbsp;",      "¡": "&iexcl;",     "¢": "&cent;",      "£": "&pound;",     "¤": "&curren;",
                "¥": "&yen;",       "¦": "&brvbar;",    "§": "&sect;",      "¨": "&uml;",       "©": "&copy;",      "ª": "&ordf;",      "«": "&laquo;",     "¬": "&not;",
                "®": "&reg;",       "¯": "&macr;",      "°": "&deg;",       "±": "&plusmn;",    "²": "&sup2;",      "³": "&sup3;",      "´": "&acute;",     "µ": "&micro;",
                "¶": "&para;",      "·": "&middot;",    "¸": "&cedil;",     "¹": "&sup1;",      "º": "&ordm;",      "»": "&raquo;",     "¼": "&frac14;",    "½": "&frac12;",
                "¾": "&frac34;",    "¿": "&iquest;",    "À": "&Agrave;",    "Á": "&Aacute;",    "Â": "&Acirc;",     "Ã": "&Atilde;",    "Ä": "&Auml;",      "Å": "&Aring;",
                "Æ": "&AElig;",     "Ç": "&Ccedil;",    "È": "&Egrave;",    "É": "&Eacute;",    "Ê": "&Ecirc;",     "Ë": "&Euml;",      "Ì": "&Igrave;",    "Í": "&Iacute;",
                "Î": "&Icirc;",     "Ï": "&Iuml;",      "Ð": "&ETH;",       "Ñ": "&Ntilde;",    "Ò": "&Ograve;",    "Ó": "&Oacute;",    "Ô": "&Ocirc;",     "Õ": "&Otilde;",
                "Ö": "&Ouml;",      "×": "&times;",     "Ø": "&Oslash;",    "Ù": "&Ugrave;",    "Ú": "&Uacute;",    "Û": "&Ucirc;",     "Ü": "&Uuml;",      "Ý": "&Yacute;",
                "Þ": "&THORN;",     "ß": "&szlig;",     "à": "&agrave;",    "á": "&aacute;",    "â": "&acirc;",     "ã": "&atilde;",    "ä": "&auml;",      "å": "&aring;",
                "æ": "&aelig;",     "ç": "&ccedil;",    "è": "&egrave;",    "é": "&eacute;",    "ê": "&ecirc;",     "ë": "&euml;",      "ì": "&igrave;",    "í": "&iacute;",
                "î": "&icirc;",     "ï": "&iuml;",      "ð": "&eth;",       "ñ": "&ntilde;",    "ò": "&ograve;",    "ó": "&oacute;",    "ô": "&ocirc;",     "õ": "&otilde;",
                "ö": "&ouml;",      "÷": "&divide;",    "ø": "&oslash;",    "ù": "&ugrave;",    "ú": "&uacute;",    "û": "&ucirc;",     "ü": "&uuml;",      "ý": "&yacute;",
                "þ": "&thorn;",     "ÿ": "&yuml;",      "Œ": "&OElig;",     "œ": "&oelig;",     "Š": "&Scaron;",    "š": "&scaron;",    "Ÿ": "&Yuml;",      "ƒ": "&fnof;",
                "ˆ": "&circ;",      "˜": "&tilde;",     "Α": "&Alpha;",     "Β": "&Beta;",      "Γ": "&Gamma;",     "Δ": "&Delta;",     "Ε": "&Epsilon;",   "Ζ": "&Zeta;",
                "Η": "&Eta;",       "Θ": "&Theta;",     "Ι": "&Iota;",      "Κ": "&Kappa;",     "Λ": "&Lambda;",    "Μ": "&Mu;",        "Ν": "&Nu;",        "Ξ": "&Xi;",
                "Ο": "&Omicron;",   "Π": "&Pi;",        "Ρ": "&Rho;",       "Σ": "&Sigma;",     "Τ": "&Tau;",       "Υ": "&Upsilon;",   "Φ": "&Phi;",       "Χ": "&Chi;",
                "Ψ": "&Psi;",       "Ω": "&Omega;",     "α": "&alpha;",     "β": "&beta;",      "γ": "&gamma;",     "δ": "&delta;",     "ε": "&epsilon;",   "ζ": "&zeta;",
                "η": "&eta;",       "θ": "&theta;",     "ι": "&iota;",      "κ": "&kappa;",     "λ": "&lambda;",    "μ": "&mu;",        "ν": "&nu;",        "ξ": "&xi;",
                "ο": "&omicron;",   "π": "&pi;",        "ρ": "&rho;",       "ς": "&sigmaf;",    "σ": "&sigma;",     "τ": "&tau;",       "υ": "&upsilon;",   "φ": "&phi;",
                "χ": "&chi;",       "ψ": "&psi;",       "ω": "&omega;",     "ϑ": "&thetasym;",  "ϒ": "&Upsih;",     "ϖ": "&piv;",       "–": "&ndash;",     "—": "&mdash;", 
                "‘": "&lsquo;",     "’": "&rsquo;",     "‚": "&sbquo;",     "“": "&ldquo;",     "”": "&rdquo;",     "„": "&bdquo;",     "†": "&dagger;",    "‡": "&Dagger;",
                "•": "&bull;",      "…": "&hellip;",    "‰": "&permil;",    "′": "&prime;",     "″": "&Prime;",     "‹": "&lsaquo;",    "›": "&rsaquo;",    "‾": "&oline;",
                "⁄": "&frasl;",     "€": "&euro;",      "ℑ": "&image;",     "℘": "&weierp;",    "ℜ": "&real;",     "™": "&trade;",     "ℵ": "&alefsym;",   "←": "&larr;",
                "↑": "&uarr;",      "→": "&rarr;",      "↓": "&darr;",      "↔": "&harr;",      "↵": "&crarr;",     "⇐": "&lArr;",      "⇑": "&UArr;",      "⇒": "&rArr;",  
                "⇓": "&dArr;",      "⇔": "&hArr;",      "∀": "&forall;",    "∂": "&part;",      "∃": "&exist;",     "∅": "&empty;",     "∇": "&nabla;",     "∈": "&isin;",  
                "∉": "&notin;",     "∋": "&ni;",        "∏": "&prod;",      "∑": "&sum;",       "−": "&minus;",     "∗": "&lowast;",    "√": "&radic;",     "∝": "&prop;",
                "∞": "&infin;",     "∠": "&ang;",       "∧": "&and;",       "∨": "&or;",        "∩": "&cap;",       "∪": "&cup;",       "∫": "&int;",       "∴": "&there4;",
                "∼": "&sim;",       "≅": "&cong;",      "≈": "&asymp;",     "≠": "&ne;",        "≡": "&equiv;",     "≤": "&le;",        "≥": "&ge;",        "⊂": "&sub;",       
                "⊃": "&sup;",       "⊄": "&nsub;",      "⊆": "&sube;",      "⊇": "&supe;",     "⊕": "&oplus;",     "⊗": "&otimes;",   "⊥": "&perp;",      "⋅": "&sdot;",      
                "⌈": "&lceil;",      "⌉": "&rceil;",     "⌊": "&lfloor;",    "⌋": "&rfloor;",     "⟨": "&lang;",       "⟩": "&rang;",      "◊": "&loz;",       "♠": "&spades;",
                "♣": "&clubs;",     "♥": "&hearts;",     "♦": "&diams;"
    };

        var entityMap = map;

        for (var key in entityMap) {
            var entity = entityMap[key];
            var regex = new RegExp(entity, 'g');
            str = str.replace(regex, key);
        }

        str = str.replace(/&quot;/g, '"');
        str = str.replace(/&amp;/g, '&');

        return str;
    }

    // Get content type name by id
    public static getContentTypeName(contentTypeId: string): string{
        var contentType = "";

        switch(contentTypeId){
            case GlobalNewsConst.newsContentTypeId :
                contentType = "NEWS";
            break;
            case GlobalNewsConst.appointmentContentTypeId :
                contentType = "APPOINTMENT";
            break;
            case GlobalNewsConst.blogContentTypeId :
                contentType = "BLOG";
            break;
            case GlobalNewsConst.spnContentTypeId :
                contentType = "STOCK & PRESS RELEASE";
            break;
            case GlobalNewsConst.opContentTypeId :
                contentType = "OPEN POSITIONS";
            break;
        }

        return contentType;
    }
}