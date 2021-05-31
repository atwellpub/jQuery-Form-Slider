# jQuery-Form-Slider
A jQuery framework for step progression inside forms.

## Dependencies:

* JQuery
* JQuery Validate https://jqueryvalidation.org/

## Demo 

https://jsfiddle.net/gh/get/jquery/3.0/atwellpub/jQuery-Form-Slider/contents

## How to implement

### HTML Example With Multiple Groups

```html
<form id="example-with-groups">

    <!-- This would be interpreted as step 1 of group "all" -->
    <div class="step">
    
      <label>
      Name
      <input name="name" required>
      </label>
      
      <label>Email
      <input name="email" required>
      </label>
    </div>
    
    <!-- This would be interpreted as step 2 of group "all"-->
    <!-- Notice the inputs in this group have `data-set-group` attributes that will be used to alter the course of progression-->
    <div class="step">
    
          <Label>Group A
          <input data-set-group="group-a" type="radio" name="important_choice" value="somevalue" required>
          </label>
          
          <Label>Group B
          <input data-set-group="group-b" type="radio" name="important_choice" value="somevalue" required>
          </label>
        
    </div>
    
    <!-- This would be interpreted as step 1 of "group-a" , and overall the 3rd step of the entire progression if "Group A" was chosen by the user -->
    <div class="step" data-group="group-a">
      <label>Group A Question</label>
      <input name="group_a_answer" required>
    </div>
    
    <!-- This would be interpreted as step 1 of "group-b" , and overall the 3rd step of the entire progression if "Group B" was chosen by the user -->
    <div class="step" data-group="group-b">
      <label>Group B Question 1</label>
      <input name="group_b_answer" required>
    </div>
    
    <!-- This would be interpreted as step 2 of "group-b" , and overall the 4th step of the entire progression if "Group B" was chosen by the user -->
    <div class="step" data-group="group-b">
      <label>Group B Question 2</label>
      <input name="group_b_answer" required>
    </div>
    
    <!-- This would be interpreted as step 3 of the "all", and would occur after the prior groups completed all their steps. -->
    <!-- Overall this step would represent the 4th step of a "all" + "group-a" progression flow and the 5th step of a "all" + "group-b" submission flow -->
    <div class="step">
      <label>Press Submit to Complete Form</label>
    </div>
    
    <!-- These buttons will hide/reveal appropriately as a user progresses through form steps -->
    <div class="">
            <button type="button" class="back">Back</button>
            <button type="button" class="next">Next</button>
            <button type="submit" class="submit">Submit</button>
    </div>
</form>
```

### jQuery
```javascript
jQuery(document).ready(function() {
    formSlider.init('#some-form-id'); /* <form></form> */
});
```

# Additional Documentation

## Insights

### Groups / Steps
1. If there's only one progression path, then there's no need to add `data-group="somegroup"` attributes to your step containers. 
2. All steps without a `data-group` attribute will default to the `all` group. 
3. The first step of the form must not contain a `data-group` attribute, or the `data-group` attribute must have a value of `"all"`
4. If a radio or select input is selected with a `data-set-group="somegroup"` attriubute, then at the click of the next button the step progression will switch to the newly set group. If a user completes all steps in a group they will be prompted with the submit button. If additional steps without `data-group` exist after all the steps of a group have been completed, the framework will progress to the next step in line of the `"all"` group that has not yet been progressed. 
5. This framework does not support sub-group branching, but it may work well if attempted.

### Buttons
1. There are three supported buttons: Back, Next, and Submit which require classes `back`, `next`, and `submit`. 

### Progress Bar
1. This framework loosely supports a progress bar, but it will probably need to be re-written to suit your needs. No tutorial is offered on how to leverage this feature at the moment, but a lot can be learned by quickly studing `jquery.form-slider.js`. 

### Field Validation

1. Currently the only field validation required is powered by the `required` attribute, and this validation depends on jQuery Validation Plugin to also be installed.

### Multiple Form Support 

1. This framework supports multiple forms. 
2. The `formSlider` object is accessible from the developers' console, too. 

