import { Directive, ElementRef, Input, AfterViewInit, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/concatmap';		

@Directive({
	selector: '[drag-reorder]',
	outputs: ['draggingDone']
})

export class DragReorderDirective implements AfterViewInit {
	@Input() dragIndex : number;
	endIndex : number = this.dragIndex;

	draggingDone = new EventEmitter();

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
				}, 500);
			})
		});

		itemmousedowns.subscribe(event => {
			console.log('mouse down');
		});

		itemmouseups.subscribe(event => {
			console.log('mouse up');
			if (this.endIndex || this.endIndex === 0) {
				this.draggingDone.emit({from: +this.dragIndex, to: +this.endIndex})
				this.elementRef.nativeElement.style.position = "static";
				this.elementRef.nativeElement.style.top = "";
				this.elementRef.nativeElement.children[0].style.borderBottom = "1px solid #dedede";
				this.elementRef.nativeElement.children[0].style.borderTop = "1px solid #dedede";

				var allSiblings = this.elementRef.nativeElement.parentElement.parentElement.children;
				resetMargins(allSiblings);

			}
		});

		dragstarts.subscribe(event => {
			console.log('drag started');
			let dragelement = this.elementRef.nativeElement;
			dragelement.children[0].style.borderBottom = "3px solid #dedede";
			dragelement.children[0].style.borderTop = "3px solid #dedede";
		});

		var drags = dragstarts.concatMap(mousedown => {
						return listmousemoves.takeUntil(listmouseups)
								.map(mousemove => {
									return {mousedown: mousedown, moved: mousemove["pageY"] - mousedown["pageY"]};
								})
						});

		function resetMargins (allSiblings) {
				for (var i = 0; i < allSiblings.length; i++) {
					allSiblings[i].children[0].style.marginTop =	 "0px";
					allSiblings[i].children[0].style.marginBottom = "0px";
				}
			}

		drags.subscribe(drag => {
			var next, previous, itemindex = +this.dragIndex, previousNone = false;
			console.log('dragged', drag);
			let dragelement = this.elementRef.nativeElement;
			dragelement.style.position = "fixed";
			dragelement.style.top = 55 + (47*itemindex) + drag.moved + "px";
			dragelement.style.zIndex = 100;
			
			var allSiblings = dragelement.parentElement.parentElement.children;

			if (drag.moved > 0){
				resetMargins(allSiblings);

				var i = Math.ceil((drag.moved - 25)/47) + 1;
				next = dragelement.parentElement;
				for (var j = 1; j <= i; j++){
					next = next.nextSibling;
					if (next.nodeName==="#text"){
						next = next.nextSibling;
						break;
					}
				}
				
				if (next && next.children){
					var nextItem = next.children[0];
					nextItem.style.marginTop = "47px";
					this.endIndex = itemindex + (i - 1);
				}
				
			}

			if (drag.moved < 0){
				resetMargins(allSiblings);

				var i = Math.ceil((-drag.moved - 25)/47) + 1;
				previous = dragelement.parentElement;
				for (var j = 1; j <= i; j++){
					if (previous.previousSibling.nodeName==='#comment'){
						previousNone = true;
						break;
					} else{
						previous = previous.previousSibling;
					}
				}

				if (previous && previous.children){
					var previousItem = previous.children[0];
					if (previousNone){
						previousItem.style.marginTop = "47px";
					} else{
						previousItem.style.marginBottom = "47px";
					}

					this.endIndex = itemindex - (i - 1);
				}
				
			}			
		});
	}
}