/**
 * Created by Руслан on 21.10.2020.
 */

import {LightningElement, api, wire, track} from 'lwc';
import recordCount from '@salesforce/apex/DynamicRelatedListController.recordCount';
import getRecords from '@salesforce/apex/DynamicRelatedListController.getRecords';
import getPluralLabel from '@salesforce/apex/DynamicRelatedListController.getPluralLabel';
import { NavigationMixin } from 'lightning/navigation';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';


export default class RelatedListDynamically extends NavigationMixin (LightningElement) {
    isRendered = false;
    @api iconName;
    @api sObjectType;
    @api relatedField;
    @api fieldsList;
    @api recordId;
    @track dataTypes;
    @track titleWithCount;
    @track listRecords;
    @track recordCount;
    @track countBool;
    @track pluralLabel;
    columns = [];

    get obj() {
        return this.sObjectType;
    }

    @wire(getObjectInfo, { objectApiName: '$obj' })
    objInfo({ data, error }) {
        if (data) {
            console.log('get');
            this.dataTypes = new Map(Object.values(data.fields).map(el => [el.apiName, el.dataType]));
        }
    }

    renderedCallback() {
        if(this.isRendered) return;
        if(this.dataTypes && this.dataTypes.size){
            console.log('data.types', this.dataTypes);
            this.columns = this.fieldsList.split(",").map((el) => ({
                label: el,
                fieldName: el,
                type: this.dataTypes.get(el).toLowerCase()
            }));
            console.log(this.columns);
            this.isRendered = true;
        }
        console.log('con');
    }

    get vals() {
        return this.recordId + '-' + this.sObjectType + '-' +
            this.relatedField + '-' +  this.fieldsList;
    }

    @wire(recordCount, {listValues : '$vals'})
    countRecords({ data }) {
        if (data) {
            this.recordCount = data;
            if ( this.recordCount ) {
                if (this.recordCount > 3) {
                    this.titleWithCount = ' (3+)';
                }
                else{
                    this.titleWithCount = ' (' + this.recordCount + ')';
                }
            }
        }
    }

    @wire(getRecords, {listValues : '$vals'})
    recordData({data }){
        if ( data ) {
            this.listRecords = data;
        }
    }

    @wire(getPluralLabel, {listValues : '$vals'})
    pluralLabel({ data }){
        if ( data ) {
            this.pluralLabel = data;
        }
    }

    createNew() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: this.sObjectType,
                actionName: 'new'
            }
        });
    }

    navigateToRelatedList() {
        this[NavigationMixin.Navigate]({
            type: "standard__recordRelationshipPage",
            attributes: {
                recordId: this.recordId,
                relationshipApiName: this.pluralLabel,
                actionName: 'view'
            }
        });
    }
}