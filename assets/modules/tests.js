export const tests=class{
	constructor(obj){
		this.settings=obj.settings;
		if(obj.elms)
			this.svg=obj.elms.svg;
	}
	length(data){
		return data.length>this.settings.length;
	}
	getluminance(hex){
		return parseInt(hex.substr(0,2),16)*.299+parseInt(hex.substr(2,2),16)*.587+parseInt(hex.substr(4,2),16)*.114;
	}
	luminance(hex){
		return this.getluminance(hex)<this.settings.luminance;
	}
	getratio(path){
		let 	box=path.getBBox(),
			width=box.width,
			height=box.height;
		return width/height;
	}
	ratio(data){
		let path=document.createElementNS(`http://www.w3.org/2000/svg`,`path`);
		path.setAttribute(`d`,data);
		this.svg.prepend(path);
		let ratio=this.getratio(path);
		path.remove();
		return ratio>this.settings.ratio;
	}
};