export const filters={
	length(data,limit){
		return data.length>limit;
	},
	getluminance(hex){
		return parseInt(hex.substr(0,2),16)*.299+parseInt(hex.substr(2,2),16)*.587+parseInt(hex.substr(4,2),16)*.114;
	},
	luminance(hex,limit){
		return this.getluminance(hex)<limit;
	},
	getratio(path){
		let 	box=path.getBBox(),
			width=box.width,
			height=box.height;
		return width/height;
	},
	ratio(data,limit,svg){
		let path=document.createElementNS(`http://www.w3.org/2000/svg`,`path`);
		path.setAttribute(`d`,data);
		svg.prepend(path);
		let ratio=this.getratio(path);
		path.remove();
		return ratio>limit;
	}
};