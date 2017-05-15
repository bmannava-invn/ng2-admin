import { Component } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {

  public form: FormGroup;
  public email: AbstractControl;
  public password: AbstractControl;
  public checkbox: AbstractControl;
  public submitted: boolean = false;

  constructor(fb:FormBuilder, private router: Router, private authService: AuthenticationService) {
    this.form = fb.group({
      'email': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
    });

    this.email = this.form.controls['email'];
    this.password = this.form.controls['password'];
    this.checkbox = this.form.controls['checkbox'];
  }

  protected login() {
    console.log(this.checkbox.value);
    this.authService.login(this.email.value, this.password.value);
  }

  // public onSubmit(values:Object):void {
  //   this.submitted = true;
  //   if (this.form.valid) {
  //     this.router.navigate(['/pages']);
  //     // your code goes here
  //     // console.log(values);
  //   }
  // }
}
