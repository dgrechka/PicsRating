/// <reference path="Core.ts" />

var CryptoJS: any;

class Adapter implements Core.IPicture {
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

namespace Client {
export class RemoteGallery implements Core.IGallery {
    constructor(private URL:string) {}
    
    public GetPictures(galName:string): JQueryPromise<Array<Core.IPicture>> {
        var result = $.Deferred<Array<Core.IPicture>>();
        var effectiveURL = this.URL+"/Gallery/?GalleryName="+galName;
        var response = $.getJSON(effectiveURL);
        response.done((res:Array<any>) => {
            var converted = res.map((picDesc) => <Core.IPicture>(new Adapter(picDesc.Name,picDesc.URL,picDesc.Caption)));           
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
}