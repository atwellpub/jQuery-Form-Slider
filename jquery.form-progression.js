/**
 * Form Progression Framework
 * @author Hudson Atwell
 */

jQ = jQuery;

var formSlider = {
    forms:[],
    init: function(id) {

        formSlider.forms[id] = {};
        formSlider.forms[id].form_id = id;
        formSlider.forms[id].currentGroup = 'all';
        formSlider.forms[id].previousGroup = 'all';
        formSlider.forms[id].groups = [];
        formSlider.forms[id].groupsProgressed = [];
        formSlider.forms[id].agnosticStepCount = 1;

        /* check if there are custom groups */
        jQ( id + ' .step').each(function(key) {

            /* get step data */
            var group = jQ(this).data('group'); /* get group name */

            /* check if step is part of a group and add to all group if not defined */
            if (!group) {
                jQ(this).attr('data-group' , 'all');
                group = "all";
            }

            /* create default variables for group array  */
            if (typeof formSlider.forms[id].groups != 'object' ) {
                formSlider.forms[id].groups = [];
            }

            /* create default variables for specific group object  */
            if (typeof formSlider.forms[id].groups[group] != 'object' ) {
                formSlider.forms[id].groups[group] = {}
                formSlider.forms[id].groups[group].initCount = 1;
                formSlider.forms[id].groups[group].currentStep = 1;
                formSlider.forms[id].groups[group].steps = [];
            } else {
                formSlider.forms[id].groups[group].initCount++;
            }

            /* set group step order as data attritube */
            var step = formSlider.forms[id].groups[group].initCount;
            jQ(this).attr('data-step' , step);

            /* create default variables for step object  */
            if (typeof formSlider.forms[id].groups[group].steps[ step ] != 'object' ) {
                formSlider.forms[id].groups[group].steps[step] = {};
                formSlider.forms[id].groups[group].steps[step].required = [];
            }

            /* get names of required inputs */
            var requiredInputs = jQ(this).find('input,textarea,select').filter('[required]');
            requiredInputs.each(function(key, object) {
                var name = jQ(this).attr('name');
                formSlider.forms[id].groups[group].steps[step].required.push(name);
            })

        })

        /* store "all" step count into groupsProgressed array -- this will be used later to determine progress bar calculations */
        formSlider.forms[id].groupsProgressed["all"] = formSlider.forms[id].groups["all"].initCount;

        /* add listeners */
        formSlider.addListeners(id);

        /* reveal step 1 */
        jQ(id + ' .step[data-step="1"][data-group="all"]').show();

        /* setup validation */
        jQ(id).validate({
          rules: {
            name: "required",
          }
        });

        /* set initial progress bar state */
        formSlider.updateProgressBar(id , true);

    },
    addListeners : function(id) {
        /* listen for next button */
        jQ(id).find('.next').on('click' , formSlider.goNext);

        /* listen for back button */
        jQ(id).find('.back').on('click' , formSlider.goBack );

        /* listen for submit button */
        jQ(id).find('.submit').on('click' , formSlider.goSubmit );

    },
    setGroup : function(formId , groupName) {

        formSlider.forms[formId].previousGroup = formSlider.forms[formId].currentGroup;
        formSlider.forms[formId].currentGroup = groupName;

        /* store the group into groupsProgressed array for progres bar calculations */
        if (typeof formSlider.forms[formId].groupsProgressed[groupName] == 'undefined') {
            formSlider.forms[formId].groupsProgressed[groupName] = formSlider.forms[formId].groups[groupName].initCount;
        }

    },
    goNext : function() {

        var formId = '#' + jQ(this).closest('form').attr('id');
        var currentGroup = formSlider.forms[formId].currentGroup;
        var currentStep = formSlider.forms[formId].groups[formSlider.forms[formId].currentGroup].currentStep;

        /* show back button on first step progression */
        formSlider.toggleBackButton(formId , 'show');

        /* check if required items are populated */
        for(var i=0; i < formSlider.forms[formId].groups[currentGroup].steps[currentStep].required.length; i++) {
            var requiredField = formSlider.forms[formId].groups[currentGroup].steps[currentStep].required[i];
            var value = jQ(formId + ' [name="'+requiredField+'"]').val();

            /* if required field does not have a value then fire validation routine */
            if (!value) {
                jQ(formId + ' [name="'+requiredField+'"]').valid();
                return;
            }

        }

        /* check to see if there's a new group path */
        var checkGroupPath = jQ(formId + ' .step[data-step="'+currentStep+'"][data-group="'+formSlider.forms[formId].currentGroup+'"]').find('[data-set-group]:checked');

        /* set new group path if it's being changed */
        var nextStep = formSlider.forms[formId].groups[formSlider.forms[formId].currentGroup].currentStep + 1;
        if (checkGroupPath.length>0) {
            formSlider.setGroup(formId, checkGroupPath.data('set-group'));
            nextStep = formSlider.forms[formId].groups[formSlider.forms[formId].currentGroup].currentStep
        }

        if (typeof formSlider.forms[formId].groups[formSlider.forms[formId].currentGroup].steps[nextStep] == 'undefined') {
            formSlider.setGroup(formId, 'all');
            nextStep = formSlider.forms[formId].groups[formSlider.forms[formId].currentGroup].currentStep + 1;
        }


        /* hide all steps */
        jQ(formId).find('.step').hide();

        /* get next step where group is equal to current group and step is equal to next step */
        jQ(formId).find('.step[data-group="'+formSlider.forms[formId].currentGroup+'"][data-step="'+nextStep+'"]').show();

        /* set current step to next step */
        formSlider.forms[formId].groups[formSlider.forms[formId].currentGroup].currentStep = nextStep;

        /* check ahead within the group */
        var lookAheadGroup = nextStep + 1;
        var hasAnotherGroupStep = false;
        if (typeof formSlider.forms[formId].groups[formSlider.forms[formId].currentGroup].steps[lookAheadGroup] != 'undefined') {
            hasAnotherGroupStep = true;
        }

        var lookAheadAll = formSlider.forms[formId].groups["all"].currentStep + 1;
        var hasAnotherAllStep = false;
        if (typeof formSlider.forms[formId].groups["all"].steps[lookAheadAll] != 'undefined') {
            hasAnotherAllStep = true;
        }

        /* if there are no steps after this one then show submit button */
        var isLastStep = false;
        if (!hasAnotherGroupStep && !hasAnotherAllStep ) {
            formSlider.toggleSubmitButton(formId);
            isLastStep = true;

        }

        /* increment agnostic step count */
        formSlider.forms[formId].agnosticStepCount++;

        /* update progressPar */
        formSlider.updateProgressBar(formId , false , isLastStep);

    },
    goBack : function() {
        var formId = '#' + jQ(this).closest('form').attr('id');
        var previousStep = formSlider.forms[formId].groups[formSlider.forms[formId].currentGroup].currentStep - 1;

        /* hide submit button */
        formSlider.toggleSubmitButton(formId , 'hide');

        /* Geesh someone refactor the below */
        /* if current group matches the previous group, treat normally */
        if ( formSlider.forms[formId].currentGroup == formSlider.forms[formId].previousGroup ) {
            formSlider.forms[formId].groups[formSlider.forms[formId].currentGroup].currentStep = previousStep - 1;
        }
        /* if current group is "all" and previous step is the first step then set current step of "all" back to 1 and switch to the previous group */
        else if ( formSlider.forms[formId].currentGroup == "all" && previousStep == 1 ) {
            formSlider.forms[formId].groups[formSlider.forms[formId].currentGroup].currentStep = previousStep;
            formSlider.setGroup(formId, formSlider.forms[formId].previousGroup);
            previousStep = formSlider.forms[formId].groups[formSlider.forms[formId].currentGroup].currentStep;
        }
        /*  if current group is not all and previous step is zero */
        else if ( formSlider.forms[formId].currentGroup != "all" && previousStep == 0 ) {
            formSlider.setGroup(formId , "all");
            previousStep = formSlider.forms[formId].groups[formSlider.forms[formId].currentGroup].currentStep;
        }
        /* else treat normally */
         else  {
            formSlider.forms[formId].groups[formSlider.forms[formId].currentGroup].currentStep = previousStep;
        }


        /* if previous step is first step hide back button */
        if (formSlider.forms[formId].currentGroup == "all" && previousStep==1 ) {
            formSlider.toggleBackButton(formId);
        }

        /* hide all steps */
        jQ(formId).find('.step').hide();

        /* get next step where group is equal to current group and step is equal to next step */
        jQ(formId).find('.step[data-group="'+formSlider.forms[formId].currentGroup+'"][data-step="'+previousStep+'"]').show();

        /* decrement agnostic step count */
        formSlider.forms[formId].agnosticStepCount--;

        /* update progressPar */
        formSlider.updateProgressBar(formId , false , false );

    },
    goSubmit : function() {
    },
    toggleSubmitButton : function(formId , toggle = '') {
        switch (toggle) {
            case 'hide':
                jQ(formId).find('.submit').hide();
                jQ(formId).find('.next').show();
                break;
            case 'show':
                jQ(formId).find('.next').hide();
                jQ(formId).find('.submit').show();
                break;
            default:
                jQ(formId).find('.next').toggle();
                jQ(formId).find('.submit').toggle();
                break;
        }
    },
    toggleBackButton : function(formId , toggle = "") {
        switch (toggle) {
            case 'hide':
                jQ(formId).find('.back').hide();
                break;
            case 'show':
                jQ(formId).find('.back').show();
                break;
            default:
                jQ(formId).find('.back').toggle();
                break;
        }
    },
    updateProgressBar : function(formId , isFirst = false , isLast = false) {

        if (!jQuery(".progress-bar").length) {
            return;
        }

        var totalSteps = 0;

        /* if first step, consider all steps as total number of possible steps */
        if (isFirst) {
            for ( var groupName in formSlider.forms[formId].groups) {
                totalSteps = totalSteps + formSlider.forms[formId].groups[groupName].initCount;
            }
        }
        /* if last step, force 100% */
        else if (isLast) {
            totalSteps = formSlider.forms[formId].agnosticStepCount;
        }
        /* if not initialization, then leverage progressed groups to calculate total steps */
        else {
            for ( var groupName in formSlider.forms[formId].groupsProgressed) {
                totalSteps = totalSteps + formSlider.forms[formId].groupsProgressed[groupName];
            }
        }

        var progressPercent = formSlider.forms[formId].agnosticStepCount / totalSteps;
        progressPercent = Math.round(progressPercent * 100);

        jQuery(".progress-bar").css("width", progressPercent + "%").html(progressPercent + "%");
    }

}
