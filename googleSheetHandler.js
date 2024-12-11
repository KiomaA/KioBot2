import googleSheetConfig from './config/googleSheetConfig.json' assert {type: "json"}
import googleCredentials from './credentials/googleCredentials.json' assert {type: "json"}
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default class GoogleSheetHandler{
    constructor(){
        const serviceAccountAuth = new JWT({
            // env var values here are copied from service account credentials generated by google
            // see "Authentication" section in docs for more info
            email: googleCredentials.client_email,
            key: googleCredentials.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
          });
          this.doc = new GoogleSpreadsheet(googleSheetConfig.sheetId, serviceAccountAuth);

          console.log(`Spreadsheet loaded, edit spreadsheet on https://docs.google.com/spreadsheets/d/${googleSheetConfig.sheetId} and run !xxx.update for each component updated`)
          
    }
    async getSheet(sheetName){
        await this.doc.loadInfo();
        const sheet = this.doc.sheetsByTitle[sheetName]
        return sheet
    }
}