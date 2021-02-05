{
	const opengraph={
		elms:{
			svg:document.querySelector(`section#image>svg`),
			canvas:document.querySelector(`canvas`),
			image:new Image
		},
		async init(){
			opengraph.blacklist=(await import(`./modules/blacklist.js`)).blacklist;
			opengraph.whitelist=(await import(`./modules/whitelist.js`)).whitelist;
			opengraph.settings=(await import(`./modules/settings.js`)).settings;
			opengraph.tests=new (await import(`./modules/tests.js`)).tests(opengraph);
			opengraph.settings.width=opengraph.elms.canvas.width;
			opengraph.settings.height=opengraph.elms.canvas.height;
			opengraph.settings.size=opengraph.settings.native*opengraph.settings.scale;
			opengraph.settings.step=opengraph.settings.size+opengraph.settings.gap;
			opengraph.settings.left=(opengraph.settings.width-opengraph.settings.columns*opengraph.settings.step+opengraph.settings.gap)/2;
			opengraph.settings.top=(opengraph.settings.height-opengraph.settings.rows*opengraph.settings.step+opengraph.settings.gap)/2;
			opengraph.load();
		},
		addsi(){
			let 	path=document.createElementNS(`http://www.w3.org/2000/svg`,`path`),
				x=opengraph.settings.left+(opengraph.settings.columns-opengraph.settings.centre)/2*opengraph.settings.step,
				y=opengraph.settings.top+(opengraph.settings.rows-opengraph.settings.centre)/2*opengraph.settings.step,
				scale=(opengraph.settings.native*opengraph.settings.scale*opengraph.settings.centre+opengraph.settings.gap*opengraph.settings.centre-opengraph.settings.gap)/opengraph.settings.native;
			path.setAttribute(`fill`,`#fff`);
			path.setAttribute(`transform`,`translate(${x},${y}) scale(${scale},${scale})`);
			if(!opengraph.settings.layout)
				path.setAttribute(`d`,icons.get(`Simple Icons`).path);
			else path.setAttribute(`d`,`M0,0H${opengraph.settings.native}V${opengraph.settings.native}H0Z`);
			opengraph.elms.svg.append(path);
		},
		draw(){
			opengraph.context.clearRect(0,0,opengraph.settings.width,opengraph.settings.height);
			opengraph.context.drawImage(opengraph.elms.image,0,0);
			URL.revokeObjectURL(opengraph.elms.image.src);
		},
		filter(obj){
			let slug=obj.slug
			if(opengraph.blacklist.includes(slug))
				return false;
			if(opengraph.whitelist.includes(slug))
				return true;
			let data=icons.get(slug).path;
			if(opengraph.tests.length(data))
				return false;
			if(opengraph.tests.luminance(obj.hex))
				return false;
			if(opengraph.tests.ratio(data))
				return false;
			obj.data=data;
			return true;
		},
		load(){
			opengraph.context=opengraph.elms.canvas.getContext(`2d`);
			opengraph.icons=Object.values(icons)
				.filter(opengraph.filter)
				.sort(()=>.5-Math.random())
				.slice(0,opengraph.settings.icons);
			opengraph.addsi();
			opengraph.populate();
			opengraph.elms.image.addEventListener(`load`,opengraph.draw);
			let xml=new XMLSerializer;
			opengraph.elms.image.src=URL.createObjectURL(
				new Blob([xml.serializeToString(opengraph.elms.svg)],{
					type:`image/svg+xml;charset=utf-8`
				})
			);
		},
		populate(){
			var icon,src,path;
			let 	count=0,
				x=opengraph.settings.left,
				y=opengraph.settings.top;
			for(icon of opengraph.icons){
				if(path)
					path=path.cloneNode(false);
				else path=document.createElementNS(`http://www.w3.org/2000/svg`,`path`);
				if(
					count>0&&
					count%opengraph.settings.columns===0
				){
					x=opengraph.settings.left;
					y+=opengraph.settings.step;
				}else if(
					y>opengraph.settings.top+(opengraph.settings.size+opengraph.settings.centre)*(opengraph.settings.rows-opengraph.settings.centre)/2&&
					y<opengraph.settings.top+(opengraph.settings.size+opengraph.settings.centre)*(opengraph.settings.rows+opengraph.settings.centre/2)&&
					(count-(opengraph.settings.columns-opengraph.settings.centre)/2)%opengraph.settings.columns===0
				){
					count+=opengraph.settings.centre;
					x+=opengraph.settings.step*opengraph.settings.centre;
				}
				path.setAttribute(`fill`,`#`+icon.hex);
				path.setAttribute(`transform`,`translate(${x},${y}) scale(${opengraph.settings.scale},${opengraph.settings.scale})`);
				if(!opengraph.settings.layout)
					path.setAttribute(`d`,icon.data);
				else path.setAttribute(`d`,`M0,0H${opengraph.settings.native}V${opengraph.settings.native}H0Z`);
				opengraph.elms.svg.append(path);
				x+=opengraph.settings.step;
				count+=1;
			}
		}
	}
	opengraph.init();
}