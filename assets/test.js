{
	const 	nodes={
			grid:document.getElementById(`grid`),
			inputs:{
				length:document.getElementById(`length`),
				luminance:document.getElementById(`luminance`),
				ratio:document.getElementById(`ratio`)
			},
			ranges:{
				length:document.getElementById(`range_length`),
				luminance:document.getElementById(`range_luminance`),
				ratio:document.getElementById(`range_ratio`)
			},
			theme:document.getElementById(`theme`),
			sort:document.getElementById(`sort`),
			count:document.getElementById(`count`).firstChild,
			total:document.getElementById(`total`).firstChild
		},
		test={
			async init(){
				test.blacklist=await test.getmodule(`blacklist`);
				test.forced=await test.getmodule(`forced`);
				test.whitelist=await test.getmodule(`whitelist`);
				test.limits=await test.getmodule(`limits`);
				test.filters=await test.getmodule(`filters`);
				test.load();
			},
			filter(obj){
				if(test.blacklist.includes(obj.slug))
					return false;
				obj.data=icons.get(obj.slug).path;
				return true;
			},
			async getmodule(name){
				let module=await import(`./modules/${name}.js`);
				return module[name];
			},
			index(key){
				test.icons.map((obj,idx)=>obj.order[key]=idx+1);
			},
			input(event){
				let target=event.target;
				if(target.validity.valid){
					test.limits[target.id]=parseFloat(target.value);
					test.count=test.icons.length;
					for(let icon of test.icons)
						if(!icon.info.whitelisted)
							test.toggle(icon);
					nodes.count.nodeValue=test.count;
				}
			},
			load(){
				nodes.inputs.length.value=test.limits.length;
				nodes.inputs.luminance.value=test.limits.luminance;
				nodes.inputs.ratio.value=test.limits.ratio;
				test.icons=Object.values(icons).filter(test.filter).sort(test.ordername);
				console.log(test.icons.map(x=>x.title));
				test.count=test.icons.length;
				nodes.total.nodeValue=test.count;
				test.populate();
				nodes.count.nodeValue=test.count;
				test.order(`length`);
				test.order(`luminance`);
				test.order(`ratio`);
				test.icons.sort(test.ordercolor).reverse();
				test.index(`color`);
				nodes.inputs.length.addEventListener(`input`,test.input,false);
				nodes.inputs.luminance.addEventListener(`input`,test.input,false);
				nodes.inputs.ratio.addEventListener(`input`,test.input,false);
				nodes.sort.addEventListener(`click`,test.sort,false);
				nodes.theme.addEventListener(`click`,test.theme,false);
			},
			order(key){
				if(key===`luminance`)
					test.icons.sort((x,y)=>x.info[key]>y.info[key]?1:-1);
				else test.icons.sort((x,y)=>x.info[key]>y.info[key]?-1:1);
				test.index(key);
				test.icons.sort(test.ordername);
				let 	min=nodes.inputs[key].min=Math.min(...test.icons.map(obj=>obj.info[key])),
					max=nodes.inputs[key].max=Math.max(...test.icons.map(obj=>obj.info[key]));
				nodes.ranges[key].append(document.createTextNode(`(${min} - ${max})`));
			},
			ordercolor(x,y){
				/* adapted from https://www.npmjs.com/package/color-sorter*/
				if(!x.info.alpha&&!y.info.alpha)
					return y.info.alpha-x.info.alpha;
				if(!x.info.alpha||!y.info.alpha)
					return x.hex.toLowerCase().localeCompare(y.hex.toLowerCase());
				if((!x.info.saturation||!y.info.saturation)&&x.info.saturation!==y.info.saturation)
					return y.info.saturation-x.info.saturation;
				if(x.info.hue!==y.info.hue)
					return x.info.hue-y.info.hue;
				if(x.info.saturation!==y.info.saturation)
					return x.info.saturation-y.info.saturation;
				if(!x.info.saturation&&!y.info.saturation&&x.info.lightness!==y.info.lightness)
					return y.info.lightness-x.info.lightness;
				if(x.info.alpha!==y.info.alpha)
					return y.info.alpha-x.info.alpha;
			},
			ordername(x,y){
				return x.title.toLowerCase().localeCompare(y.title.toLowerCase());
			},
			populate(){
				let 	order=1,
					color,luminance,hex,name,path,ratio,length,svg;
				for(let icon of test.icons){
					if(svg){
						svg=svg.cloneNode(false);
						path=path.cloneNode(false);
						name=name.cloneNode(false);
						hex=hex.cloneNode(false);
						length=length.cloneNode(false);
						luminance=luminance.cloneNode(false);
						ratio=ratio.cloneNode(false);
					}else{
						svg=document.createElementNS(`http://www.w3.org/2000/svg`,`svg`),
						path=document.createElementNS(`http://www.w3.org/2000/svg`,`path`),
						name=document.createElement(`p`),
						hex=name.cloneNode(false),
						length=name.cloneNode(false);
						luminance=name.cloneNode(false);
						ratio=name.cloneNode(false);
						svg.setAttribute(`viewBox`,`0 0 24 24`);
						name.dataset.sort=`name`;
						hex.dataset.sort=`color`;
						length.dataset.sort=`length`;
						luminance.dataset.sort=`luminance`;
						ratio.dataset.sort=`ratio`;
					}
					icon.item=document.createElement(`li`);
					icon.item.style.order=order;
					path.setAttribute(`fill`,`#`+icon.hex);
					path.setAttribute(`d`,icon.data);
					svg.append(path);
					name.append(document.createTextNode(icon.title));
					icon.item.append(svg);
					nodes.grid.append(icon.item);
					color=tinycolor(icon.hex).toHsl();
					icon.info={
						whitelisted:test.forced.includes(icon.slug)||test.whitelist.includes(icon.slug),
						length:icon.data.length,
						ratio:(test.filters.getratio(path)*100|0)/100,
						luminance:(test.filters.getluminance(icon.hex)*100|0)/100,
						hue:color.h,
						saturation:color.s,
						lightness:color.l,
						alpha:color.a
					};
					icon.order={name:order++};
					hex.append(document.createTextNode(`Hex: #`+icon.hex));
					length.append(document.createTextNode(`Length: `+icon.info.length));
					luminance.append(document.createTextNode(`Luminance: `+icon.info.luminance));
					ratio.append(document.createTextNode(`Ratio: `+icon.info.ratio));
					icon.item.append(name,hex,length,luminance,ratio);
					if(!icon.info.whitelisted)
						test.toggle(icon);
				}
			},
			sort(event){
				let	target=event.target,
					key=target.dataset.sort;
				if(key&&key!==document.body.dataset.sort){
					document.body.dataset.sort=key;
					for(let icon of test.icons)
						icon.item.style.order=icon.order[key];
				}
			},
			theme(){
				document.body.dataset.theme=document.body.dataset.theme===`dark`?`light`:`dark`;
			},
			toggle(icon){
				let hide=icon.info.length>test.limits.length||icon.info.luminance<test.limits.luminance||icon.info.ratio>test.limits.ratio;
				test.count-=hide;
				icon.item.classList.toggle(`hide`,hide)
			}
		};
	test.init();
}
