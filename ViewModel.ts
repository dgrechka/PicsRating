
/// <reference path="Core.ts" />
/// <reference path="Cookies.ts" />

var picturePlaceHolder:Core.IPicture = {
    GetCaption: () => "Loading...",
    GetName: () => "Picture placeholder",
    GetURL: () => "#"
}

namespace ViewModels {
export class VoteVM {
    private pictures: Array<Core.IPicture> = [];
    constructor(private gallery:Core.IGallery, private voter:Core.IVote,private galleryName:string) {
            this.UserName(Cookies.getCookie("username"));
            this.Authword(Cookies.getCookie("authword"));
            
            var picturesPromise = gallery.GetPictures(galleryName);
    
            picturesPromise
                .done((pictures:Array<Core.IPicture>) => {
                    this.pictures = pictures;
                    this.Regenerate();
                })
                .fail((error:any) => console.error(error));      
    }
    
    
    public UserName = ko.observable("");
    public picA = ko.observable<Core.IPicture>(picturePlaceHolder);
    public picB = ko.observable<Core.IPicture>(picturePlaceHolder);
    public Authword= ko.observable("");
    public Authword2= ko.observable("");
    public CanRate= ko.pureComputed(() => {
        var nameFilled = this.UserName().length>0;
        var authworkFilled = this.Authword().length>0;
        var autwordsMatch = this.AuthwordsMatch();
        return nameFilled && authworkFilled && autwordsMatch;
    });
    public AuthwordsMatch =ko.pureComputed(() => {
        return this.Authword()===this.Authword2();
    });
    public votedA= () => {        
        this.voter.Vote(this.picA(),this.picB(),this.UserName(),this.Authword());
        this.Regenerate();
        this.SaveCreds();
    };
    public votedB= () => {
        this.voter.Vote(this.picB(),this.picA(),this.UserName(),this.Authword());
        this.Regenerate();
        this.SaveCreds();
    };
    public Regenerate= () => {
        var aIdx = Math.floor((Math.random() * this.pictures.length));
        var bIdx = Math.floor((Math.random() * this.pictures.length));
        if(aIdx===bIdx)
            this.Regenerate();
        else
        {
            this.picA(this.pictures[aIdx]);
            this.picB(this.pictures[bIdx]);
        }
    };
    private SaveCreds() {
        Cookies.setCookie("username",this.UserName(),9999);
        Cookies.setCookie("authword",this.Authword(),9999);
    }
};

    export class StatsVM {
        constructor(private stats: Core.IGalleryStats) { }
        
        public Populate(galleryName:string) {
            
            var promise = this.stats.GetStats(galleryName);
    
            promise
                .done((pictures:Array<Core.IPictureStats>) => {
                    this.Pictures(pictures);                    
                })
                .fail((error:any) => console.error(error));                              
        }
        
        public Pictures = ko.observableArray<Core.IPictureStats>();
        
    }
}