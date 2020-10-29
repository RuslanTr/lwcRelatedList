/**
 * Created by Руслан on 20.10.2020.
 */

public class DynamicRelatedListController {
    @AuraEnabled(cacheable=true)
    public static Integer numOfRecords(String listValues) {
        List < String > strList = listValues.split('-');
        String recordId = strList.get(0);
        String sObjectType = strList.get(1);
        String relatedField = strList.get(2);
        String filter = ' FROM ' + sObjectType
                + ' WHERE ' + relatedField
                + ' = \'' + recordId + '\' ';
        String strCountSOQL = ' SELECT COUNT() ' + filter;
        return Database.countQuery(strCountSOQL);
    }

    @AuraEnabled(cacheable=true)
    public static List<SObject> getRecords(String listValues) {
        List < String > strList = listValues.split('-');
        String recordId = strList.get(0);
        String sObjectType = strList.get(1);
        String relatedField = strList.get(2);
        String fieldsList = strList.get(3);
        String strSOQL = 'SELECT Id';
        strSOQL += ', ' + fieldsList;
        String filter = ' FROM ' + sObjectType
                + ' WHERE ' + relatedField
                + ' = \'' + recordId + '\' ';
        strSOQL += filter + ' LIMIT 3';
        return Database.query(strSOQL);
    }

    @AuraEnabled(cacheable=true)
    public static String getPluralLabel(String listValues) {
        List < String > strList = listValues.split('-');
        String sObjectType = strList.get(1);
        SObjectType obj = Schema.getGlobalDescribe().get(sObjectType);
        Schema.DescribeSObjectResult objResult = obj.getDescribe();
        String pluralLabel = objResult.getLabelPlural();
        return pluralLabel;
    }
}

