{
	const 	nodes={
			grid:document.getElementById(`grid`),
			inputs:{
				length:document.getElementById(`length`),
				luminance:document.getElementById(`luminance`),
				ratio:document.getElementById(`ratio`)
			},
			theme:document.getElementById(`theme`),
			sort:document.getElementById(`sort`),
			count:document.getElementById(`count`).firstChild,
			total:document.getElementById(`total`).firstChild
		},
		test={
			async init(){
				test.limits=await test.getmodule(`limits`);
				test.filters=await test.getmodule(`filters`);
				test.load();
			},
			async getmodule(name){
				let module=await import(`./modules/${name}.js`);
				return module[name];
			},
			getpath(obj){
				obj.data=icons.get(obj.slug).path;
				return obj;
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
						test.toggle(icon);
					nodes.count.nodeValue=test.count;
				}
			},
			load(){
				nodes.inputs.length.value=test.limits.length;
				nodes.inputs.luminance.value=test.limits.luminance;
				nodes.inputs.ratio.value=test.limits.ratio;
				test.icons=Object.values(icons).map(test.getpath).sort(test.ordername);
				test.count=test.icons.length;
				nodes.total.nodeValue=test.count;
				test.populate();
				nodes.count.nodeValue=test.count;
				test.order(`length`);
				test.order(`luminance`);
				test.order(`ratio`);
				test.icons.reverse().sort(test.ordercolor).reverse();
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
				nodes.inputs[key].nextElementSibling.append(document.createTextNode(`(${min} - ${max})`));
			},
			ordercolor(x,y){
				/* adapted from https://www.npmjs.com/package/color-sorter */
				x=x.info;
				y=y.info;
				if((!x.saturation||!y.saturation)&&x.saturation!==y.saturation)
					return y.saturation-x.saturation;
				if(x.hue!==y.hue)
					return x.hue-y.hue;
				if(x.saturation!==y.saturation)
					return x.saturation-y.saturation;
				if(!x.saturation&&!y.saturation&&x.lightness!==y.lightness)
					return y.lightness-x.lightness;
				return y.luminance-x.luminance;
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
					color=test.filters.gethsl(icon.hex);
					icon.info={
						hue:test.round(color.hue),
						length:icon.data.length,
						lightness:test.round(color.lightness),
						luminance:test.round(test.filters.getluminance(icon.hex)),
						ratio:test.round(test.filters.getratio(path)),
						saturation:test.round(color.saturation)
					};
					icon.order={name:order++};
					hex.append(document.createTextNode(`Hex: #`+icon.hex));
					length.append(document.createTextNode(`Length: `+icon.info.length));
					luminance.append(document.createTextNode(`Luminance: `+icon.info.luminance));
					ratio.append(document.createTextNode(`Ratio: `+icon.info.ratio));
					icon.item.append(name,hex,length,luminance,ratio);
					test.toggle(icon);
				}
			},
			round(val){
				return Math.round(val*100)/100;
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
				let hide=icon.info.length>test.limits.length;
				hide=hide||icon.info.luminance<test.limits.luminance;
				hide=hide||icon.info.hue<test.limits.hsl.hue;
				hide=hide||icon.info.saturation<test.limits.hsl.saturation;
				hide=hide||icon.info.lightness<test.limits.hsl.lightness;
				hide=hide||icon.info.ratio>test.limits.ratio;
				test.count-=hide;
				icon.item.classList.toggle(`hide`,hide)
			}
		};
	test.init();
}
