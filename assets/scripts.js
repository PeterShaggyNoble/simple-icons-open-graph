{
	og={
		blacklist:[`Simple Icons`],
		whitelist:[],
		settings:{
			icons:68,
			columns:12,
			rows:6,
			gap:48,
			centre:2,
			scale:2
		},
		thresholds:{
			luminance:96,
			length:5000,
			ratio:3
		},
		tests:{
			luminance(hex){
				return parseInt(hex.substr(0,2),16)*.299+parseInt(hex.substr(2,2),16)*.587+parseInt(hex.substr(4,2),16)*.114<og.thresholds.luminance;
			},
			length(data){
				return data.length>og.thresholds.length;
			},
			ratio(data){
				let path=document.createElementNS(`http://www.w3.org/2000/svg`,`path`);
				path.setAttribute(`d`,data);
				og.elms.svg.prepend(path);
				let 	rect=path.getBoundingClientRect(),
					width=rect.width,
					height=rect.height;
				path.remove();
				return width/height>og.thresholds.ratio;
			}
		},
		elms:{
			svg:document.querySelector(`section>svg`),
			rect:document.querySelector(`rect`),
			path:document.querySelector(`path`),
			canvas:document.querySelector(`canvas`)
		},
		objs:{
			xml:new XMLSerializer,
			image:new Image
		},
		async init(){
			og.context=og.elms.canvas.getContext(`2d`);
			og.settings.width=og.elms.canvas.width;
			og.settings.height=og.elms.canvas.height;
			og.settings.size=24*og.settings.scale;
			og.settings.step=og.settings.size+og.settings.gap;
			og.settings.left=(og.settings.width-og.settings.columns*og.settings.step+og.settings.gap)/2;
			og.settings.top=(og.settings.height-og.settings.rows*og.settings.step+og.settings.gap)/2;
			og.json=await(await fetch(`simple-icons.json`)).json();
			og.data=Object.entries(await(await fetch(`https://houseofdesign.ie/data/icons/simpleicons.json`)).json());
			og.elms.path.setAttribute(`d`,og.data.find(arr=>arr[0]===`simpleicons`)[1]);
			og.icons=og.json.icons
				.map(og.setup)
				.filter(og.filter)
				.sort(()=>.5-Math.random())
				.slice(0,og.settings.icons);
			og.populate();
			og.objs.image.addEventListener(`load`,og.draw);
			og.objs.image.src=URL.createObjectURL(og.getblob);
		},
		draw(){
			og.context.clearRect(0,0,og.settings.width,og.settings.height);
			og.context.drawImage(og.objs.image,0,0);
			URL.revokeObjectURL(og.objs.image.src);
		},
		filter(obj){
			if(og.blacklist.includes(obj.title))
				return false;
			if(og.whitelist.includes(obj.title))
				return true;
			if(og.tests.luminance(obj.hex))
				return false;
			if(og.tests.length(obj.data))
				return false;
			if(og.tests.ratio(obj.data))
				return false;
			return true;
		},
		getblob(){
			return new Blob([og.objs.xml.serializeToString(og.elms.svg)],{
				type:`image/svg+xml;charset=utf-8`
			});
		},
		normalise(string){
			return string
				.toLowerCase()
				.replace(/\+/g,`plus`)
				.replace(/^\./,`dot-`)
				.replace(/\.$/,`-dot`)
				.replace(/\./g,`-dot-`)
				.replace(/^&/,`and-`)
				.replace(/&$/,`-and`)
				.replace(/&/g,`-and-`)
				.replace(/đ/g,`d`)
				.replace(/ħ/g,`h`)
				.replace(/ı/g,`i`)
				.replace(/ĸ/g,`k`)
				.replace(/ŀ/g,`l`)
				.replace(/ł/g,`l`)
				.replace(/ß/g,`ss`)
				.replace(/ŧ/g,`t`)
				.normalize(`NFD`)
				.replace(/[\u0300-\u036f]/g,``)
				.replace(/[^a-z0-9_\-]/g,``);
		},
		populate(){
			let 	icon,src,path,
				count=0,
				x=og.settings.left,
				y=og.settings.top;
			for(icon of og.icons){
				if(path)
					path=path.cloneNode(false);
				else path=document.createElementNS(`http://www.w3.org/2000/svg`,`path`);
				if(
					count>0&&
					count%og.settings.columns===0
				){
					x=og.settings.left;
					y+=og.settings.step;
				}else if(
					y>og.settings.top+(og.settings.size+og.settings.centre)*(og.settings.rows-og.settings.centre)/2&&
					y<og.settings.top+(og.settings.size+og.settings.centre)*(og.settings.rows+og.settings.centre/2)&&
					(count-(og.settings.columns-og.settings.centre)/2)%og.settings.columns===0
				){
					count+=og.settings.centre;
					x+=og.settings.step*og.settings.centre;
				}
				path.setAttribute(`fill`,`#`+icon.hex);
				path.setAttribute(`transform`,`translate(${x},${y}) scale(${og.settings.scale},${og.settings.scale})`);
				path.setAttribute(`d`,icon.data);
				og.elms.rect.after(path);
				x+=og.settings.step;
				count+=1;
			}
		},
		setup(obj){
			obj.data=og.data.find(arr=>
				arr[0]===(obj.slug||og.normalise(obj.title))
			)[1];
			return obj;
		}
	}
	og.init();
}