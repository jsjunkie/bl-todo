import { Directive, ElementRef, Input, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/concatmap';		

@Directive({
	selector: '[drag-reorder]'
})

export class DragReorderDirective implements AfterViewInit {
	@Input() dragIndex : number;
	endIndex : number;

	constructor(private elementRef : ElementRef) {

	}

	ngAfterViewInit() : void {
		var element = this.elementRef.nativeElement;
		var ionList = element.parentElement.parentElement;
		var itemmousedowns = Observable.fromEvent(element, 'mousedown');
		var itemmouseups = Observable.fromEvent(element, 'mouseup');
		var listmousemoves = Observable.fromEvent(ionList, 'mousemove');
		var listmouseups = Observable.fromEvent(ionList, 'mouseup');

		var dragstarts = Observable.create(observer => {
			itemmousedowns.subscribe(mousedown => {
				var mouseupdone = false, timer, mousemovedone = false;
				itemmouseups.subscribe(mouseup => {
					mouseupdone = true;
					clearTimeout(timer);
				});

				listmousemoves.subscribe(mousemove => {
					mousemovedone = true;
					clearTimeout(timer);
				});

				timer = setTimeout(() => {
					if (!mouseupdone && !mousemovedone) {
						observer.next(mousedown);
					}
				}, 1000);
			})
		});

		itemmousedowns.subscribe(event => {
			console.log('mouse down');
		});

		itemmouseups.subscribe(event => {
			console.log('mouse up');
		});

		dragstarts.subscribe(event => {
			console.log('drag started')
		});

		var drags = dragstarts.concatMap(mousedown => {
						return listmousemoves.takeUntil(listmouseups)
								.map(mousemove => {
									return {mousedown: mousedown, moved: mousemove["pageY"] - mousedown["pageY"]};
								})
						});

		drags.subscribe(drag => {
			var next, previous, itemindex = +this.dragIndex;
			console.log('dragged', drag);
			let dragelement = this.elementRef.nativeElement;
			dragelement.style.position = "fixed";
			dragelement.style.top = 55 + (47*itemindex) + drag.moved + "px";
			dragelement.style.zIndex = 100;
			var allSiblings = dragelement.parentElement.parentElement.children;

			function resetMargins () {
				for (var i = 0; i < allSiblings.length; i++) {
					if (allSiblings[i].localName === "ion-item-sliding") {
						allSiblings[i].children[0].style.marginTop =	 "0px";
						allSiblings[i].children[0].style.marginBottom = "0px";
					}
				}
			}

			if (drag.moved > 0){
				resetMargins();

				var i = Math.ceil((drag.moved - 25)/47) + 1;
				next = dragelement.parentElement;
				for (var j = 1; j <= i; j++){
					next = next.nextSibling;
				}
				
				if (next && next.children){
					var nextItem = next.children[0];
					nextItem.style.marginTop = "47px";
					this.endIndex = itemindex + (i - 1);

				}
				
			}

			if (drag.moved < 0){
				resetMargins();

				var i = Math.ceil((-drag.moved - 25)/47) + 1;
				previous = dragelement.parentElement;
				for (var j = 1; j <= i; j++){
					previous = previous.previousSibling;
				}

				if (previous && previous.children){
					var previousItem = previous.children[0];
					previousItem.style.marginBottom = "47px";
					this.endIndex = itemindex - (i - 1);
				}
				
			}			
		});
	}
}