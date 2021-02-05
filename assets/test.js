{
	const test={
		elms:{
			grid:document.getElementById(`grid`),
			length:document.getElementById(`length`),
			luminance:document.getElementById(`luminance`),
			ratio:document.getElementById(`ratio`),
			range:{
				length:document.getElementById(`range_length`),
				luminance:document.getElementById(`range_luminance`),
				ratio:document.getElementById(`range_ratio`)
			},
			sort:document.getElementById(`sort`),
			count:document.getElementById(`count`).firstChild,
			theme:document.getElementById(`theme`)
		},
		async init(){
			test.blacklist=(await import(`./modules/blacklist.js`)).blacklist;
			test.forced=(await import(`./modules/forced.js`)).forced;
			test.whitelist=(await import(`./modules/whitelist.js`)).whitelist;
			test.settings=(await import(`./modules/settings.js`)).settings;
			test.elms.length.value=test.settings.length;
			test.elms.luminance.value=test.settings.luminance;
			test.elms.ratio.value=test.settings.ratio;
			test.methods=new (await import(`./modules/tests.js`)).tests(test);
			test.icons=Object.values(icons).filter(test.filter);
			test.count=test.icons.length;
			test.populate();
			test.elms.count.nodeValue=test.count;
			test.order(`length`);
			test.order(`luminance`);
			test.order(`ratio`);
			test.icons.forEach(obj=>obj.item.style.order=obj.order.ratio);
			test.elms.length.addEventListener(`input`,test.input,false);
			test.elms.luminance.addEventListener(`input`,test.input,false);
			test.elms.ratio.addEventListener(`input`,test.input,false);
			test.elms.sort.addEventListener(`click`,test.sort,false);
			test.elms.theme.addEventListener(`click`,test.theme,false);
		},
		filter(obj){
			if(test.blacklist.includes(obj.slug))
				return false;
			obj.data=icons.get(obj.slug).path;
			return true;
		},
		input(event){
			let target=event.target;
			if(target.validity.valid){
				test.settings[target.id]=parseFloat(target.value);
				test.count=test.icons.length;
				for(let icon of test.icons)
					if(!icon.info.whitelisted)
						test.toggle(icon);
				test.elms.count.nodeValue=test.count;
			}
		},
		order(key){
			if(key===`luminance`)
				test.icons.sort((x,y)=>x.info[key]>y.info[key]?1:-1);
			else test.icons.sort((x,y)=>x.info[key]>y.info[key]?-1:1);
			test.icons.map((obj,idx)=>obj.order[key]=idx+1);
			let 	min=test.elms[key].min=Math.min(...test.icons.map(obj=>obj.info[key])),
				max=test.elms[key].max=Math.max(...test.icons.map(obj=>obj.info[key]));
			test.elms.range[key].append(document.createTextNode(`(${min} - ${max})`));
		},
		populate(){
			var item,luminance,name,path,ratio,length,svg;
			let order=1;
			for(let icon of test.icons){
				if(svg){
					svg=svg.cloneNode(false);
					path=path.cloneNode(false);
					name=name.cloneNode(false);
					length=length.cloneNode(false);
					luminance=luminance.cloneNode(false);
					ratio=ratio.cloneNode(false);
				}else{
					svg=document.createElementNS(`http://www.w3.org/2000/svg`,`svg`),
					path=document.createElementNS(`http://www.w3.org/2000/svg`,`path`),
					name=document.createElement(`p`),
					length=name.cloneNode(false);
					luminance=name.cloneNode(false);
					ratio=name.cloneNode(false);
					name.dataset.sort=`name`;
					length.dataset.sort=`length`;
					luminance.dataset.sort=`luminance`;
					ratio.dataset.sort=`ratio`;
					svg.setAttribute(`viewBox`,`0 0 24 24`);
				}
				icon.item=document.createElement(`li`);
				icon.item.style.order=order;
				path.setAttribute(`fill`,`#`+icon.hex);
				path.setAttribute(`d`,icon.data);
				svg.append(path);
				name.append(document.createTextNode(icon.title));
				icon.item.append(svg);
				test.elms.grid.append(icon.item)
				icon.info={
					whitelisted:test.forced.includes(icon.slug)||test.whitelist.includes(icon.slug)
				}
				if(!icon.info.whitelisted){
					icon.info.length=icon.data.length;
					icon.info.luminance=(test.methods.getluminance(icon.hex)*100|0)/100;
					icon.info.ratio=(test.methods.getratio(path)*100|0)/100;
				}
				icon.order={
					name:order++
				};
				length.append(document.createTextNode(`Length: `+icon.info.length));
				luminance.append(document.createTextNode(`Luminance: `+icon.info.luminance));
				ratio.append(document.createTextNode(`Ratio: `+icon.info.ratio));
				icon.item.append(name,length,luminance,ratio);
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
			let hide=icon.info.length>test.settings.length||icon.info.luminance<test.settings.luminance||icon.info.ratio>test.settings.ratio;
			test.count-=hide;
			icon.item.classList.toggle(`hide`,hide)
		}
	};
	test.init();
}
