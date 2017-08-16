import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  items: Array<{title: string, checked: string, editmode: boolean, position: number}>;
  deleteditems: Array<{title: string, checked: string, editmode: boolean, position: number}>;
  newitem: string;
  newvalue: string;
  
  constructor(public navCtrl: NavController, private storage: Storage) {
  	this.items = [];
    this.deleteditems = [];
    let that = this;
    this.storage.get('items').then(function (result){
      if (result){
        that.items = JSON.parse(result);
      }
    }, function (err) {
      console.error(err);
    });

    this.storage.get('deleteditems').then(function (result) {
      if (result) {
        that.deleteditems = JSON.parse(result);
      }
    }, function (err) {
      console.log(err);
    })
  }

  saveToStorage() {
    this.storage.set('items', JSON.stringify(this.items));
  }

  saveDeletedToStorage(){
    this.storage.set('deleteditems', JSON.stringify(this.deleteditems));
  }

  additem (){
    if (this.newitem && this.newitem.trim() !== ""){
      let newitemObj = { title: this.newitem, checked: "", editmode: false, position: this.items.length + 1};
      this.items.push(newitemObj);
      this.newitem = '';

      this.saveToStorage();
    } 
  }

  enableEditing (item) {
    this.newvalue = item.title;
    item.editmode= true;
  }

  edititem (item) {
    var indexOfItem = this.items.indexOf(item);
    this.items[indexOfItem].title = this.newvalue;
    this.items[indexOfItem].editmode = false;

    this.saveToStorage();
  }

  deleteitem (item) {
    var indexOfItem = this.items.indexOf(item);
    if (indexOfItem > -1) {
      this.deleteditems.push(this.items[indexOfItem]);
      this.items.splice(indexOfItem, 1);

      this.saveToStorage();
      this.saveDeletedToStorage();
    }
  }

  reorderItems(indexes) {
    if (indexes.from !== indexes.to) {
      let element = this.items[indexes.from];
      this.items.splice(indexes.from, 1);
      this.items.splice(indexes.to, 0, element);
      
      this.positionitems();
      this.saveToStorage();
    }
  }

  positionitems (){
    for (var i = 0; i < this.items.length; i++) {
      this.items[i].position = i + 1;
    }
  }

  checkitem (item) {
    item.checked = (item.checked === "") ? "checked" : "";

    this.saveToStorage();
  }
}
