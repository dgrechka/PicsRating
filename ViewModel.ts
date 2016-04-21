
/// <reference path="Core.ts" />
/// <reference path="Cookies.ts" />

var picturePlaceHolder:Core.IPicture = {
    GetCaption: () => "Loading...",
    GetName: () => "Picture placeholder",
    GetURL: () => "#"
}

class Pair {
    constructor(public Left:number,public Right:number) {}
    
    public Swap() {
        var t = this.Left ;
        this.Left = this.Right;
        this.Right = t; 
    }
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

namespace ViewModels {
export class VoteVM {
    private pictures: Array<Core.IPicture> = [];
    private pairs:Array<Pair> = []    
    constructor(private gallery:Core.IGallery, private voter:Core.IVote,private galleryName:string) {
            this.UserName(Cookies.getCookie("username"));
            this.Authword(Cookies.getCookie("authword"));
            
            var picturesPromise = gallery.GetPictures(galleryName);
    
            picturesPromise
                .done((pictures:Array<Core.IPicture>) => {
                    this.pictures = pictures;
                    var len = pictures.length;
                    for(var i=0;i<len-1;i++)
                        for(var j=i+1;j<len;j++)
                            this.pairs.push(new Pair(i,j));
                            
                    var len2 = this.pairs.length;                              
                    for(var i=0; i<len2;i++)
                        if(Math.random()<0.5)
                            this.pairs[i].Swap();
                            
                    shuffle(this.pairs);
                    
                    this.picA(this.pictures[this.pairs[0].Left]);
                    this.picB(this.pictures[this.pairs[0].Right]);
                })
                .fail((error:any) => console.error(error));      
    }
    
    public Idx = ko.observable(0);
    public UserName = ko.observable("");
    public picA = ko.observable<Core.IPicture>(picturePlaceHolder);
    public picB = ko.observable<Core.IPicture>(picturePlaceHolder);
    public Authword= ko.observable("");
    public Authword2= ko.observable("");
    public Done = $.Deferred<void>();
    public GetProgress = ko.pureComputed(() => {
        this.Idx(); //peek
        if(this.pairs.length === 0)
            return "0%";
        return Math.floor(this.Idx()/this.pairs.length*100.0)+"%";
    });
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
       this.Idx(this.Idx()+1);
       if(this.Idx() == this.pairs.length)
        this.Done.resolve();
       else {
            this.picA(this.pictures[this.pairs[this.Idx()].Left]);
            this.picB(this.pictures[this.pairs[this.Idx()].Right]);
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