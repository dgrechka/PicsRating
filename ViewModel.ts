
/// <reference path="Core.ts" />
/// <reference path="Cookies.ts" />

namespace ViewModel {
export class ViewModel {
    constructor(private pictures: Array<Core.IPicture>, private voter:Core.IVote) {
            this.UserName(Cookies.getCookie("username"));
            this.Authword(Cookies.getCookie("authword"));  
    }
    
    public UserName = ko.observable("");
    public picA = ko.observable<Core.IPicture>(this.pictures[0]);
    public picB = ko.observable<Core.IPicture>(this.pictures[1]);
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
        var aIdx = Math.floor((Math.random() * this.pictures.length))
        var bIdx = Math.floor((Math.random() * this.pictures.length))
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
}