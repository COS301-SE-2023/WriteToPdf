import { Component, OnInit, HostListener, ElementRef } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss']
})
export class CameraComponent {

  private trigger: Subject<any> = new Subject();
  public webcamImage!: WebcamImage;
  private nextWebcam: Subject<any> = new Subject();
  sysImage = '';
  public webcamWidth: number = 0;
  public webcamHeight: number = 0;
  public sidebarVisible = false;

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    this.trigger.next(void 0);
    this.setWebcamSize();
  }

  public getSnapshot(): void {
    this.trigger.next(void 0);
  }

  public captureImg(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.sysImage = webcamImage!.imageAsDataUrl;
    console.info('got webcam image', this.sysImage);
  }

  public get invokeObservable(): Observable<any> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<any> {
    return this.nextWebcam.asObservable();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event) {
    this.setWebcamSize();
  }

  setWebcamSize() {
    const deviceWidth = window.innerWidth;
    const deviceHeight = window.innerHeight;

    // Calculate the desired width and height based on the device size
    // Adjust the calculations as per your requirements
    this.webcamWidth = deviceWidth * 0.6;
    this.webcamHeight = deviceWidth * 0.6;
  }

}
