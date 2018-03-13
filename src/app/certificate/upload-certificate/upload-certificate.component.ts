import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { CertificateService, AlertService } from '../../services/index';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NgProgress } from 'ngx-progressbar';
import { CustomValidator } from '../../directives/custom-validator';

@Component({
  selector: 'app-upload-cert',
  templateUrl: './upload-certificate.component.html',
  styleUrls: ['./upload-certificate.component.css']
})
export class UploadCertificateComponent implements OnInit {
  form: FormGroup;
  cert;
  key;
  keyExtension: boolean = true;
  certExtension: boolean = true;
  overwrite = '0';
  @ViewChild('fileInput') fileInput: ElementRef;
  @Output() notify: EventEmitter<any> = new EventEmitter<any>();

  constructor(private certificateService: CertificateService, public ngProgress: NgProgress, private alertService: AlertService, public formBuilder: FormBuilder) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      key: null,
      cert: null,
      overwrite: '0'
    });

    // Set default value on form
    this.form.get('overwrite').setValue('0');
  }
  
  public toggleModal(isOpen: Boolean) {
    let certificate_modal = <HTMLDivElement>document.getElementById('upload_certificate_modal');
    if (isOpen) {
      certificate_modal.classList.add('is-active');
      return;
    }
    certificate_modal.classList.remove('is-active');
    this.fileInput.nativeElement.value = "";
    this.keyExtension = true;
    this.certExtension = true;
    this.overwrite = '0';
  }

  onKeyChange(event) {
    var fileName = event.target.files[0].name;
    var ext = fileName.substr(fileName.lastIndexOf('.') + 1);
    console.log('type', ext);
    if(ext!=="key"){ 
      this.keyExtension = false;
    } else {
      this.keyExtension = true;
    }
    if(event.target.files.length > 0) {
      let file = event.target.files[0];
      this.key = file
    }
  }

  onCertChange(event) {
    var fileName = event.target.files[0].name;
    var ext = fileName.substr(fileName.lastIndexOf('.') + 1);
    console.log('type', ext);
    if(ext!=="cert"){ 
      this.certExtension = false;
    } else {
      this.certExtension = true;
    }
    if(event.target.files.length > 0) {
      let file = event.target.files[0];
      this.cert = file;
    }
  }

  onOverwriteChange(event) {
    if(event.target.checked) {
      this.overwrite = '1';
    }
  }

  uploadCertificate() {
    if (this.cert && this.key) {
      let formData = new FormData();
      formData.append('key', this.cert, this.cert.name);
      formData.append('cert', this.key, this.key.name);
      formData.append('overwrite', this.overwrite);
      
      /** request started */
      this.ngProgress.start();
      this.certificateService.uploadCertificate(formData).
          subscribe(
          data => {
            /** request completed */
            this.ngProgress.done();
            this.notify.emit();
            this.toggleModal(false);
            this.alertService.success(data.result);
          },
          error => {
            /** request completed */
            this.ngProgress.done();
            if (error.status === 0) {
                console.log('service down ', error);
            } else {
                this.alertService.error(error.statusText);
            }
          });
    } else {
      this.alertService.error('Key or Certificate is missing');
    }
  }

}
