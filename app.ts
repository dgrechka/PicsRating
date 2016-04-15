 /// <reference path="typings/tsd.d.ts"/>

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
    CanRate: ko.pureComputed(() => {
        return vm.UserName().length>0;
    }),
    votedA: () => {
        console.log("voted A");
        Vote(vm.picA(),vm.picB());        
        RegenPics();
    },
    votedB: () => {        
        console.log("voted B");
        Vote(vm.picB(),vm.picA());
        RegenPics();
    }
};

function Vote(picWin: IPicture,picLose: IPicture) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", votesRegistryPath+"?username="+vm.UserName()+"&picWin="+picWin.GetName()+"&picLose="+picLose.GetName(), true);
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
};

//console.log("number of pics:"+pics.length);