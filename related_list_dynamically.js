/**
 * Created by Руслан on 21.10.2020.
 */

import {LightningElement, api, wire, track} from 'lwc';
import numOfRecords from '@salesforce/apex/DynamicRelatedListController.numOfRecords';
import getRecords from '@salesforce/apex/DynamicRelatedListController.getRecords';
import getPluralLabel from '@salesforce/apex/DynamicRelatedListController.getPluralLabel';
import { NavigationMixin } from 'lightning/navigation';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';


export default class RelatedListDynamically extends NavigationMixin (LightningElement) {
    chartJsInitialized = false;
    @api iconName;
    @api sObjectType;
    @api relatedField;
    @api fieldsList;
    @api recordId;
    @track dataTypes;
    @track titleWithCount;
    @track listRecords;
    @track numOfRecords;
    @track pluralLabel;
    columns = [];

    get objectName() {
        return this.sObjectType;
    }

    @wire(getObjectInfo, { objectApiName: '$objectName' })
    getHeadersTypesMap({ data, error }) {
        if (data) {
            this.dataTypes = new Map(Object.values(data.fields).map(el => [el.apiName, el.dataType]));
        }
    }

    renderedCallback() {
        if(this.chartJsInitialized) return;
        if(this.dataTypes && this.dataTypes.size){
            this.columns = this.fieldsList.split(",").map((el) => ({
                label: el,
                fieldName: el,
                type: this.dataTypes.get(el).toLowerCase()
            }));
            this.chartJsInitialized = true;
        }
    }

    get valuesToSelect() {
        return this.recordId + '-' + this.sObjectType + '-' +
            this.relatedField + '-' +  this.fieldsList;
    }

    @wire(numOfRecords, {listValues : '$valuesToSelect'})
    numberOfRecords({ data }) {
        if (data) {
            this.numOfRecords = data;
            if ( this.numOfRecords ) {
                if (this.numOfRecords > 3) {
                    this.titleWithCount = ' (3+)';
                }
                else{
                    this.titleWithCount = ' (' + this.numOfRecords + ')';
                }
            }
        }
    }

    @wire(getRecords, {listValues : '$valuesToSelect'})
    recordData({data }){
        if ( data ) {
            this.listRecords = data;
        }
    }

    @wire(getPluralLabel, {listValues : '$valuesToSelect'})
    getPluralLabel({ data }){
        if ( data ) {
            this.pluralLabel = data;
        }
    }
    createNewSObject() {
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
