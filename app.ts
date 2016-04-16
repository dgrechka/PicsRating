 /// <reference path="typings/tsd.d.ts"/>

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}

var CryptoJS: any;

interface IPicture {
    GetURL():string;
    GetName():string;
}

var path = "sample_images/";
var votesRegistryPath = "api/vote"

var catPicture : IPicture = {
    GetURL: () => path+"cat.png",
    GetName: () => "Cat"    
};
var birdsPicture : IPicture = {
    GetURL: () => path+"birds.jpg",
    GetName: () => "Birds"    
};
var earthPicture : IPicture = {
    GetURL: () => path+"earth.jpg",
    GetName: () => "Earth"    
};
var elPicture : IPicture = {
    GetURL: () => path+"elef.jpg",
    GetName: () => "Elephant"    
};
var goatPicture : IPicture = {
    GetURL: () => path+"goat.jpg",
    GetName: () => "Goat"    
};
var leafPicture : IPicture = {
    GetURL: () => path+"leaf.jpg",
    GetName: () => "Leaf"    
};

var pics = [catPicture,birdsPicture,earthPicture,elPicture,goatPicture,leafPicture];

var vm:any = {
    UserName: ko.observable(""),
    picA : ko.observable<IPicture>(pics[0]),
    picB : ko.observable<IPicture>(pics[1]),
    Authword: ko.observable(""),
    Authword2: ko.observable(""),
    CanRate: ko.pureComputed(() => {
        var nameFilled = vm.UserName().length>0;
        var authworkFilled = vm.Authword().length>0;
        var autwordsMatch = vm.AuthwordsMatch();
        return nameFilled && authworkFilled && autwordsMatch;
    }),
    AuthwordsMatch:ko.pureComputed(() => {
        return vm.Authword()===vm.Authword2();
    }),
    votedA: () => {
        console.log("voted left: prefer "+vm.picA().GetName()+" to "+vm.picB().GetName()+". UserSig "+ vm.NameSignature());
        Vote(vm.picA(),vm.picB());        
        RegenPics();
        SaveCreds();
    },
    votedB: () => {        
        console.log("voted right: prefer "+vm.picB().GetName()+" to "+vm.picA().GetName()+". UserSig "+ vm.NameSignature());
        Vote(vm.picB(),vm.picA());
        RegenPics();
        SaveCreds();
    },
    NameSignature: ko.pureComputed(() => {
        return CryptoJS.MD5(vm.UserName()+vm.Authword());
    }),
};

function SaveCreds() {
    setCookie("username",vm.UserName(),9999);
    setCookie("authword",vm.Authword(),9999);
}

function Vote(picWin: IPicture,picLose: IPicture) {
    var xhttp = new XMLHttpRequest();
    var voteHash =  CryptoJS.MD5(vm.UserName()+vm.Authword()+picWin.GetName()+picLose.GetName());
    xhttp.open("GET", votesRegistryPath+"?voteID=1&username="+vm.UserName()+"&picWin="+picWin.GetName()+"&picLose="+picLose.GetName()+"&userSig="+vm.NameSignature()+"&voteSig="+voteHash, true);
    xhttp.send();        
}


function setApic(pic:IPicture) {
    vm.picA(pic);
}

function setBpic(pic:IPicture) {
    vm.picB(pic);
}

function RegenPics() {    
    var aIdx = Math.floor((Math.random() * pics.length))
    var bIdx = Math.floor((Math.random() * pics.length))
    if(aIdx===bIdx)
        RegenPics();
    else
    {
        setApic(pics[aIdx]);
        setBpic(pics[bIdx]);
    }
}




window.onload = () => {
    RegenPics();
    ko.applyBindings(vm);
    vm.UserName(getCookie("username"));
    vm.Authword(getCookie("authword"));    
};

//console.log("number of pics:"+pics.length);