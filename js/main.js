
var albumApp = {};

albumApp.init = function(){
	albumApp.getArtists();
}



// The search finds artist in the chosen genre
albumApp.getArtists = function(){
	$('form').on('submit', function(e){
		e.preventDefault();
// get the check boxes that are checked

		$('#albumGallery').empty();
		var genreSelected = $('input[type=checkbox]:checked');
		var genreArray = [];
		
		// get the value of EACH checkBox
		genreSelected.each(function(item, el){
			genreArray.push($(el).val());
		});
		console.log(genreArray);

// loop through values assign value for each request
		var genreTypes = genreArray.map(function(genre){
			return $.ajax({
				url: 'https://api.spotify.com/v1/search',
			    dataType: 'json',
			    method:'GET',
			    data: {
			    	q: 'genre:' + genre,
			    	type: 'artist',
			    	limit: 50
			    }
			})
		});
		$.when.apply(null,genreTypes)
			.then(function(){ 
				var artistTypes = Array.prototype.slice.call(arguments); 
				albumApp.getId(artistTypes);
		});
	});
}


albumApp.getId = function(array){
	console.log(array);
	var mappedArray = array.map(function(item){
		return item[0];
	});
	// console.log(mappedArray)
	mappedArray = mappedArray.map(function(item){
		return item.artists.items;
	})
	mappedArray = albumApp.flatten(mappedArray);
	// console.log(mappedArray);

	mappedArray = mappedArray.map(function(item){
		return {id: item.id, name: item.name};
	});
	// console.log(mappedArray);
	albumApp.getArtistsAlbums(mappedArray);
}

// use the artist IDs to search for the albums of the artists

albumApp.getArtistsAlbums = function(mappedArray) {
	// console.log(mappedArray)
	var artistsAlbums = mappedArray.map(function(item){
		return $.ajax({
			url: 'https://api.spotify.com/v1/artists/'+item.id+'/albums',
			dataType: 'json',
			method: 'GET',
		});
		// var artist = item.name
		// return {album: album, artist: artist}
	});
	// console.log(artistsAlbums);
	$.when.apply(null,artistsAlbums)
		.then(function() {
			var artistsAlbumsData = Array.prototype.slice.call(arguments);
			// console.log(artistsAlbumsData);

			albumApp.getAlbums(artistsAlbumsData, mappedArray);
		});
}
// take the array of arrays and find the individual albums and add them to an array
albumApp.getAlbums = function(arrayOfAlbums, arrayOfArtists) {
	// console.log(arrayOfAlbums);
	var albumArray = arrayOfAlbums.map(function(album) {
		return album[0].items;
	});

	// console.log(albumArray)

	albumArray = albumArray.map(function(album, i) {
		return {
			albums: album,
			artist: arrayOfArtists[i]
		}
	})
	.map(function(artist) {
		return artist.albums.map(function(singleAlbum) {
			return Object.assign({artist: artist.artist.name},singleAlbum)
		});
	});

	albumArray = albumApp.flatten(albumArray);
	// console.log(albumArray);

	albumApp.albumListArray(albumArray);
}
// create the final list 
albumApp.albumListArray = function(listOfAlbums) {
	console.log(listOfAlbums);
	var lengthSelected = $('input[type=radio]:checked').val();
		// console.log(lengthSelected)

// Create a list of the albums with their artists
	var list = [];
	for (var i = 0; i < lengthSelected; i++) {
		list.push(albumApp.getRandomAlbumList(listOfAlbums));
	}
	albumApp.displayList(list);
}
// Display randomized list to a length of chosen by users (Week(7), Month(28), Year(365))


albumApp.displayList = function(singleAlbum) {
	console.log(singleAlbum);
	// Create a Header for the content section
		var headerText = $('<h2>').text('Here are your results');
		var contentHeader = $('<header>').append(headerText);

		$('#albumGallery').prepend(contentHeader);

	
	singleAlbum.forEach(function(album){
		var albumName = $('<h3>').text(album.name);
		var artistName = $('<p>').text(album.artist)
		
		var link = album.uri;
		var slicedLink = link.slice(14);
		var albumLink = $('<a>').attr('href', 'https://play.spotify.com/album/' + slicedLink).attr('target', '_blank');
		var albumPlay = $('<i>').addClass('fa fa-play').attr('aria-hidden', "true");
		var albumLinkText = $(albumLink).append(albumPlay).addClass("circle");


		var albumGalleryItemText = $('<div>').addClass('albumGalleryItemText').append(albumName, artistName, albumLinkText)

		var albumArt = $('<img>').attr('src', album.images[1].url);

		var albumArtContainer = $('<div>').addClass('albumArtContainer').append(albumArt);

		var albumGallery = $('<div>').addClass('albumGalleryItem').append(albumGalleryItemText, albumArtContainer);
			// console.log(albumGallery);
		$('#albumGallery').append(albumGallery);
	});
}




// Randomize the list
albumApp.getRandomAlbumList = function(AlbumArray) {
	var index = Math.floor(Math.random() * AlbumArray.length);
	return AlbumArray[index];
}

// Flatten the array
albumApp.flatten = function (arrayToFlatten) {
	return arrayToFlatten.reduce(function(a,b){
		return a.concat(b);
	},[]);
}

// albumApp.smoothScrool = function(){	
// 	$('#submit').smoothScroll({
// 			speed: 200
// 	});
// }



$(function(){
	albumApp.init();
});