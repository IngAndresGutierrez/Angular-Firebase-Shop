import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { finalize } from "rxjs/operators";

import { MyValidators } from "./../../../utils/validators";
import { ProductsService } from "@core/services/products/products.service";
import { AngularFireStorage } from "@angular/fire/storage";
import { Observable } from "rxjs";

@Component({
  selector: "app-form-product",
  templateUrl: "./form-product.component.html",
  styleUrls: ["./form-product.component.scss"]
})
export class FormProductComponent implements OnInit {
  form: FormGroup;
  image$: Observable<any>;

  constructor(
    private formBuilder: FormBuilder,
    private productsService: ProductsService,
    private router: Router,
    private storage: AngularFireStorage
  ) {
    this.buildForm();
  }

  ngOnInit() {}

  saveProduct(event: Event) {
    event.preventDefault();
    if (this.form.valid) {
      const product = this.form.value;
      this.productsService.createProduct(product).subscribe(newProduct => {
        console.log(newProduct);
        this.router.navigate(["./admin/products"]);
      });
    }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      id: ["", [Validators.required]],
      title: ["", [Validators.required]],
      price: ["", [Validators.required, MyValidators.isPriceValid]],
      image: [""],
      description: ["", [Validators.required]]
    });
  }

  get priceField() {
    return this.form.get("price");
  }

  uploadFile(event) {
    const file = event.target.files[0];
    const name = file.name;
    const fileRef = this.storage.ref(name);
    const task = this.storage.upload(name, file);

    console.log(name);
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          this.image$ = fileRef.getDownloadURL();
          this.image$.subscribe(url => {
            this.form.get("image").setValue(url);
            console.log(url);
          });
        })
      )
      .subscribe();
  }
}
