import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  clientId = '';
  clientSecret = '';
  returnedCode: string = null;

  accessToken: string = null;
  gists: [] = [];

  editedGist = null;
  newFileFilename = '';
  newFileContent = '';
  editedGistFilesArray: [] = [];
  deletedFiles: string[] = [];
  description = '';

  feedback = {
    type: '',
    message: ''
  };

  constructor(private httpClient: HttpClient) { }
  ngOnInit(): void {
    const params = new URLSearchParams(window.location.search);
    this.returnedCode = params.get('code');
  }

  onClick() {
    this.httpClient.post('https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token', {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code: this.returnedCode
    }, {
      headers: {
        Accept: 'application/json'
      }
    }).subscribe((res: Object) => {
      this.accessToken = res['access_token'];
      this.loadGists();
    }, error => {
      this.feedback = { type: 'error', message: error.message };
    });
  }

  loadGists() {
    this.httpClient.get('https://api.github.com/gists', {
      headers: {
        'Authorization': 'token ' + this.accessToken,
        'Accept': 'application/vnd.github.v3+json'
      }
    }).subscribe(res => {
      this.gists = res as [];
    }, error => {
      this.feedback = { type: 'error', message: error.message };
    });
  }

  deleteGist(gistId: string, index) {
    this.httpClient.delete(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': 'token ' + this.accessToken,
        'Accept': 'application/vnd.github.v3+json'
      }
    }).subscribe(res => {
      this.feedback = { type: 'success', message: 'Gist Deleted Successfully' };
      this.gists.splice(index, 1);
    }, error => {
      this.feedback = { type: 'error', message: error.message };
    });
  }

  selectGist(id: string) {
    this.editedGistFilesArray = [];
    this.deletedFiles = [];
    this.httpClient.get(`https://api.github.com/gists/${id}`, {
      headers: {
        'Authorization': 'token ' + this.accessToken,
        'Accept': 'application/vnd.github.v3+json'
      }
    }).subscribe(res => {
      this.editedGist = res;
      this.description = res.description;
      for (const filename in res.files) {
        this.editedGistFilesArray.push(res.files[filename]);
      }
    }, error => {
      this.feedback = { type: 'error', message: error.message };
    });
  }

  saveGist(isEdited: boolean) {
    const files = {};
    let filesSize = 0;
    this.editedGistFilesArray.map(file => {
      if (file.content.trim() === '') {
        this.feedback = { type: 'error', message: 'Empty files are won\'t be uploaded to server' };
        return;
      }
      files[file.filename] = file;
      filesSize++;
    });

    if (this.deletedFiles.length > 0) {
      this.deletedFiles.forEach(deletedFilename => {
        files[deletedFilename] = null;
        filesSize++;
      });
    }

    if (filesSize > 0) {
      const payload = {
        description: this.description,
        files: files
      };

      if (isEdited) {
        this.editRequest(payload)
          .subscribe(res => {
            this.feedback = { type: 'success', message: 'Gist Edited Successfully' };
          }, error => {
            this.feedback = { type: 'error', message: error.message };
          });
      } else {
        this.saveRequest(payload)
          .subscribe(res => {
            this.feedback = { type: 'success', message: 'Gist Created Successfully' };
          }, error => {
            this.feedback = { type: 'error', message: error.message };
          });
      }
    } else {
      this.feedback = {
        type: 'error',
        message: 'No files to upload'
      };
    }
  }

  saveFile() {
    this.editedGistFilesArray.push({
      'filename': this.newFileFilename,
      'content': this.newFileContent
    });
  }

  createNewGist() {
    this.editedGist = null;
    this.description = '';
    this.deletedFiles = [];
    this.editedGistFilesArray = [];
    this.newFileFilename = '';
    this.newFileContent = '';
  }

  private editRequest(payload) {
    return this.httpClient.patch(`https://api.github.com/gists/${this.editedGist.id}`, payload, {
      headers: {
        'Authorization': 'token ' + this.accessToken,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
  }

  private saveRequest(payload) {
    return this.httpClient.post(`https://api.github.com/gists`, payload, {
      headers: {
        'Authorization': 'token ' + this.accessToken,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
  }

}
