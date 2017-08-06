import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  selectedItem: any;
  icons: string[];
  items: Array<{title: string, checked: string}>;
  homeitems: Array<{title: string, checked: string, editmode: boolean, position: number}>;

  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage) {
    this.items = [];
    this.homeitems = [];
    let that = this;

    this.storage.get('deleteditems').then(function (result) {
      debugger;
      if (result){
        that.items = JSON.parse(result);
      }
    }, function (err) {
      console.log(err);
    });

    this.storage.get('items').then(function (result){
      if (result){
        that.homeitems = JSON.parse(result);
      }
    }, function (err) {
      console.error(err);
    });
  }

  saveDeletedToStorage(){
    this.storage.set('deleteditems', JSON.stringify(this.items));
  }

  saveHomeItemsToStorage(){
    this.storage.set('items', JSON.stringify(this.homeitems));
  }

  removeitem (item) {
    var indexOfItem = this.items.indexOf(item);
    if (indexOfItem > -1) {
      this.items.splice(indexOfItem, 1);

      this.saveDeletedToStorage();
    }
  }

  restoreitem (item) {
    this.homeitems.push({ title: item.title, checked: "", editmode: false, position: this.homeitems.length + 1});
    this.removeitem(item);

    this.saveHomeItemsToStorage();
  }

  clearitem (item) {
    this.removeitem(item);
  }
}
