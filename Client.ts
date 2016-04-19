/// <reference path="Core.ts" />

var CryptoJS: any;

class PictureAdapter implements Core.IPicture {
    constructor(private Name:string,private URL:string,private Caption:string) {}
    
    public GetURL() {
        return this.URL;
    }
    
    public GetCaption() {
        return this.Caption;
    }
    
    public GetName() {
        return this.Name;
    }
}

class PictureStatsAdapter extends PictureAdapter implements Core.IPictureStats {
    constructor(
        Name:string,URL:string,Caption:string,
        private Wins:number, private Loses:number, private GalleryWinsPortion:number, private GalleryLosesPortion:number 
    )
    {
        super(Name,URL,Caption);
    }
    
    public GetWinRate(): number {
        return  this.Wins/(this.Wins+this.Loses);
    }
    public GetWins(): number {
        return this.Wins;
    }
    public GetLoses(): number {
        return this.Loses;
    }
    public GetGalleryWinsPortion(): number {
        return this.GalleryWinsPortion;
    }
    public GetGalleryLosesPortion(): number {
        return  this.GalleryLosesPortion;;
    } 
}

namespace Client {
    export class RemoteGallery implements Core.IGallery {
        constructor(private URL:string) {}
    
        public GetPictures(galName:string): JQueryPromise<Array<Core.IPicture>> {
            var result = $.Deferred<Array<Core.IPicture>>();
            var effectiveURL = this.URL+"/Gallery/?GalleryName="+galName;
            var response = $.getJSON(effectiveURL);
            response.done((res:Array<any>) => {
                var converted = res.map((picDesc) => <Core.IPicture>(new PictureAdapter(picDesc.Name,picDesc.URL,picDesc.Caption)));           
                result.resolve(converted);
            }).fail((error:any) => {result.reject(error)});
            return result;
        }  
    }

    export class RemoteVoter implements Core.IVote {
        constructor(private URL:string) {}
    
        public Vote(picWin: Core.IPicture,picLose: Core.IPicture,username:string,authword:string) {
            var nameHash = CryptoJS.MD5(username+authword);
            var voteHash =  CryptoJS.MD5(username+authword+picWin.GetName()+picLose.GetName());
            console.log("prefered "+picWin.GetName()+" to "+picLose.GetName()+". UserSig "+ nameHash);
            var effectiveURL = this.URL+"/Vote/?voteName=itis_logo&username="+username+"&picWin="+picWin.GetName()+"&picLose="+picLose.GetName()+"&userSig="+nameHash+"&voteSig="+voteHash;
            $.get(effectiveURL);           
        }
    }

    export class RemoteGalleryStats implements Core.IGalleryStats {
        constructor(private URL:string) {}
    
        public GetStats(galName:string): JQueryPromise<Array<Core.IPicture>> {
            var result = $.Deferred<Array<Core.IPicture>>();
            var effectiveURL = this.URL+"/GalleryStats/?GalleryName="+galName;
            var response = $.getJSON(effectiveURL);
            response.done((res:Array<any>) => {
                var converted = res.map((p) => <Core.IPictureStats>(new PictureStatsAdapter(p.Name,p.URL,p.Caption,p.Wins,p.Loses,p.GalWinPortion,p.GalLosePortion)));           
                result.resolve(converted);
            }).fail((error:any) => {result.reject(error)});
            return result;
        }  
    }
}