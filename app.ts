/// <reference path="typings/main.d.ts"/>
/// <reference path="Core.ts" />
/// <reference path="Client.ts" />
/// <reference path="ViewModel.ts" />

var serviceURL = "http://home.dgrechka.net/PicsRating";

window.onload = () => {
    var gallery: Core.IGallery = new Client.RemoteGallery(serviceURL);
    var voter: Core.IVote = new Client.RemoteVoter(serviceURL);
        
    var picturesPromise = gallery.GetPictures("itis_logo");
    
    picturesPromise
        .done((pictures:Array<Core.IPicture>) => {
            var viewModel = new ViewModel.ViewModel(pictures,voter);
            ko.applyBindings(viewModel);
            viewModel.Regenerate();
        })
        .fail((error:any) => console.error(error));      
};