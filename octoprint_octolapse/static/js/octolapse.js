
$(function () {

    Octolapse = this;
    // Finds the first index of an array with the matching predicate
    Octolapse.arrayFirstIndexOf = function (array, predicate, predicateOwner) {
        for (var i = 0, j = array.length; i < j; i++) {
            if (predicate.call(predicateOwner, array[i])) {
                return i;
            }
        }
        return -1;
    }
    // Retruns an observable sorted by name(), case insensitive
    Octolapse.nameSort = function (observable) {
        return observable().sort(
            function (left, right) {
                leftName = left.name().toLowerCase();
                rightName = right.name().toLowerCase();
                return leftName == rightName ? 0 : (leftName < rightName ? -1 : 1);
            });
    };
    // Toggles an element based on the data-toggle attribute.  Expects list of elements containing a selector, onClass and offClass.
    // It will apply the on or off class to the result of each selector, which should return exactly one result.
    Octolapse.toggle = function (caller, args) {
        var elements = args.elements;
        elements.forEach(function (item, index) {
            element = $(item.selector);
            onClass = item.onClass;
            offClass = item.offClass;
            if (element.hasClass(onClass)) {
                element.removeClass(onClass);
                element.addClass(offClass);
            } else {
                element.removeClass(offClass);
                element.addClass(onClass);
            }
        });
    };
    // Apply the toggle click event to every element within our settings that has the .toggle class


    Octolapse.ToggleElement = function (element) {
        var args = $(this).attr("data-toggle");
        Octolapse.toggle(this, JSON.parse(args));
    };


    // Add custom validator for csv floats
    $.validator.addMethod('csvFloat', function (value) {
        return /^(\s*-?\d+(\.\d+)?)(\s*,\s*-?\d+(\.\d+)?)*\s*$/.test(value);
    }, 'Please enter a list of decimals separated by commas.');
    // Add a custom validator for csv floats between 0 and 100
    $.validator.addMethod('csvRelative', function (value) {
        return /^(\s*\d{0,2}(\.\d+)?|100(\.0+)?)(\s*,\s*\d{0,2}(\.\d+)?|100(\.0+)?)*\s*$/.test(value);
    }, 'Please enter a list of decimals between 0.0 and 100.0 separated by commas.');

    
    $.validator.addMethod('integer', function (value) {
        return /^-?\d+$/.test(value);
    }, 'Please enter an integer value.');
    $.validator.addMethod('integerPositive', function (value) {
        return /^\d+$/.test(value);
    }, 'Please enter a positive integer value.');
    Octolapse.SettingsViewModel = function(parameters) {
        // Create a reference to this object
        var self = this;
        // Add this object to our Octolapse namespace
        Octolapse.Settings = this;
        // Create an empty add/edit profile so that the initial binding to the empty template works without errors.
        Octolapse.Settings.AddEditProfile = ko.observable({ "templateName": "empty-template", "profileObservable": ko.observable() });
        // Assign the Octoprint settings to our namespace
        Octolapse.Settings.global_settings = parameters[0];
        // Create other observables
        Octolapse.Settings.is_octolapse_enabled = ko.observable();

        // Called before octoprint binds the viewmodel to the plugin
        self.onBeforeBinding = function() {
            // Assign values to each observable
            self.settings = self.global_settings.settings.plugins.octolapse;
            Octolapse.Settings.is_octolapse_enabled(self.settings.is_octolapse_enabled());
            

            /*
                Create our printers view model
            */
            var printerSettings =
                {
                    'current_profile_guid': self.settings.current_printer_profile_guid()
                    , 'profiles': ko.toJS(self.settings.printers)
                    , 'default_profile': ko.toJS(self.settings.default_printer_profile)
                    , 'profileOptions': null
                    , 'profileViewModelCreateFunction': Octolapse.PrinterProfileViewModel
                    , 'profileValidationRules': Octolapse.PrinterProfileValidationRules
                    , 'bindingElementId': 'octolapse_printer_tab'
                    , 'addEditTemplateName': 'printer-template'
                    , 'profileTypeName': 'Printer'
                    , 'addUpdatePath': 'addUpdateProfile'
                    , 'removeProfilePath': 'removeProfile'
                    , 'setCurrentProfilePath': 'setCurrentProfile'
                };
            Octolapse.Printers = new Octolapse.ProfilesViewModel(printerSettings);

            var stabilizationSettings =
                {
                    'current_profile_guid': self.settings.current_stabilization_profile_guid()
                    , 'profiles': ko.toJS(self.settings.stabilizations)
                    , 'default_profile': ko.toJS(self.settings.default_stabilization_profile)
                    , 'profileOptions': { 'stabilization_type_options': self.settings.stabilization_type_options }
                    , 'profileViewModelCreateFunction': Octolapse.StabilizationProfileViewModel
                    , 'profileValidationRules': Octolapse.StabilizationProfileValidationRules
                    , 'bindingElementId': 'octolapse_stabilization_tab'
                    , 'addEditTemplateName': 'stabilization-template'
                    , 'profileTypeName': 'Stabilization'
                    , 'addUpdatePath': 'addUpdateProfile'
                    , 'removeProfilePath': 'removeProfile'
                    , 'setCurrentProfilePath': 'setCurrentProfile'
                };
            
            Octolapse.Stabilizations = new Octolapse.ProfilesViewModel(stabilizationSettings);
            var snapshotSettings =
                {
                    'current_profile_guid': self.settings.current_snapshot_profile_guid()
                    , 'profiles': ko.toJS(self.settings.snapshots)
                    , 'default_profile': ko.toJS(self.settings.default_snapshot_profile)
                    , 'profileOptions': { 'snapshot_format_options': self.settings.snapshot_format_options }
                    , 'profileViewModelCreateFunction': Octolapse.SnapshotProfileViewModel
                    , 'profileValidationRules': Octolapse.SnapshotProfileValidationRules
                    , 'bindingElementId': 'octolapse_snapshot_tab'
                    , 'addEditTemplateName': 'snapshot-template'
                    , 'profileTypeName': 'Snapshot'
                    , 'addUpdatePath': 'addUpdateProfile'
                    , 'removeProfilePath': 'removeProfile'
                    , 'setCurrentProfilePath': 'setCurrentProfile'
                };
            Octolapse.Snapshots = new Octolapse.ProfilesViewModel(snapshotSettings);

            var renderingSettings =
                {
                    
			
                    'current_profile_guid': self.settings.current_rendering_profile_guid()
                    , 'profiles': ko.toJS(self.settings.renderings)
                    , 'default_profile': ko.toJS(self.settings.default_rendering_profile)
                    , 'profileOptions': {
                        'rendering_fps_calculation_options': self.settings.rendering_fps_calculation_options
                        , 'rendering_output_format_options': self.settings.rendering_output_format_options
                    }
                    , 'profileViewModelCreateFunction': Octolapse.RenderingProfileViewModel
                    , 'profileValidationRules': Octolapse.RenderingProfileValidationRules
                    , 'bindingElementId': 'octolapse_rendering_tab'
                    , 'addEditTemplateName': 'rendering-template'
                    , 'profileTypeName': 'Rendering'
                    , 'addUpdatePath': 'addUpdateProfile'
                    , 'removeProfilePath': 'removeProfile'
                    , 'setCurrentProfilePath': 'setCurrentProfile'
                };
            Octolapse.Renderings = new Octolapse.ProfilesViewModel(renderingSettings);
            var cameraSettings =
                {
                    'current_profile_guid': self.settings.current_camera_profile_guid()
                    , 'profiles': ko.toJS(self.settings.cameras)
                    , 'default_profile': ko.toJS(self.settings.default_camera_profile)
                    , 'profileOptions': {
                        'camera_powerline_frequency_options': self.settings.camera_powerline_frequency_options
                        , 'camera_exposure_type_options': self.settings.camera_exposure_type_options
                        , 'camera_led_1_mode_options': self.settings.camera_led_1_mode_options
                    }
                    , 'profileViewModelCreateFunction': Octolapse.CameraProfileViewModel
                    , 'profileValidationRules': Octolapse.CameraProfileValidationRules
                    , 'bindingElementId': 'octolapse_camera_tab'
                    , 'addEditTemplateName': 'camera-template'
                    , 'profileTypeName': 'Camera'
                    , 'addUpdatePath': 'addUpdateProfile'
                    , 'removeProfilePath': 'removeProfile'
                    , 'setCurrentProfilePath': 'setCurrentProfile'
                };
            Octolapse.Cameras = new Octolapse.ProfilesViewModel(cameraSettings);
            
            var debugSettings =
                {
                    'current_profile_guid': self.settings.current_debug_profile_guid()
                    , 'profiles': ko.toJS(self.settings.debug_profiles)
                    , 'default_profile': ko.toJS(self.settings.default_debug_profile)
                    , 'profileOptions': { 'debug_profile_options': self.settings.debug_profile_options }
                    , 'profileViewModelCreateFunction': Octolapse.DebugProfileViewModel
                    , 'profileValidationRules': Octolapse.DebugProfileValidationRules
                    , 'bindingElementId': 'octolapse_debug_tab'
                    , 'addEditTemplateName': 'debug-template'
                    , 'profileTypeName': 'Debug'
                    , 'addUpdatePath': 'addUpdateProfile'
                    , 'removeProfilePath': 'removeProfile'
                    , 'setCurrentProfilePath': 'setCurrentProfile'
                };
            Octolapse.DebugProfiles = new Octolapse.ProfilesViewModel(debugSettings);

            
        }
        /*
            Show and hide the settings tabs based on the enabled parameter
        */
        self.toggleOctolapseEnabled = function(enabled) {
            isEnabled = enabled();
            if (isEnabled == null) {
                return;
            }
            $settings = $('#octolapse_settings');
            $settings.hide();
            data = JSON.stringify({ "enabled": isEnabled });
            $.ajax({
                url: "/plugin/octolapse/setEnabled",
                type: "POST",
                data: data,
                contentType: "application/json",
                dataType: "json",
                success: function(data) {
                    $settings = $('#octolapse_settings');
                    if (data.enabled)
                        $settings.show();
                    else
                        $settings.hide();
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    alert("Unable to enable/disable octolapse!.  Status: " + textStatus + ".  Error: " + errorThrown);
                }
            });

        }
        /*
            Profile Add/Update routine for showAddEditDialog
        */
        self.addUpdateProfile = function(profile) {
            switch (profile.templateName) {
                case "printer-template":
                    Octolapse.Printers.addUpdateProfile(profile.profileObservable, self.hideAddEditDialog());
                    break;
                case "stabilization-template":
                    Octolapse.Stabilizations.addUpdateProfile(profile.profileObservable, self.hideAddEditDialog());
                    break;
                case "snapshot-template":
                    Octolapse.Snapshots.addUpdateProfile(profile.profileObservable, self.hideAddEditDialog());
                    break;
                case "rendering-template":
                    Octolapse.Renderings.addUpdateProfile(profile.profileObservable, self.hideAddEditDialog());
                    break;
                case "camera-template":
                    Octolapse.Cameras.addUpdateProfile(profile.profileObservable, self.hideAddEditDialog());
                    break;
                case "debug-template":
                    Octolapse.DebugProfiles.addUpdateProfile(profile.profileObservable, self.hideAddEditDialog());
                    break;
                default:
                    alert("Cannot save the object, the template (" + profile.templateName + ") is unknown!");
                    break;
            }

        };

        
    
        
        /*
            Modal Dialog Functions
        */
        // hide the modal dialog
        self.hideAddEditDialog = function(sender, event) {
            $("#octolapse_add_edit_profile_dialog").modal("hide");
        };
        // show the modal dialog
        self.showAddEditDialog = function(options, sender) {
            // Create all the variables we want to store for callbacks
            dialog = this;
            dialog.sender = sender;
            dialog.profileObservable = options.profileObservable;
            dialog.templateName = options.templateName
            dialog.$addEditDialog = $("#octolapse_add_edit_profile_dialog");
            dialog.$addEditForm = dialog.$addEditDialog.find("#octolapse_add_edit_profile_form");
            dialog.$cancelButton = $("a.cancel", dialog.$addEditDialog);
            dialog.$saveButton = $("a.save", dialog.$addEditDialog);
            dialog.$defaultButton = $("a.set-defaults", dialog.$addEditDialog);
            dialog.$dialogTitle = $("h3.modal-title", dialog.$addEditDialog);
            dialog.$summary = dialog.$addEditForm.find("#add_edit_validation_summary");
            dialog.$errorCount = dialog.$summary.find(".error-count");
            dialog.$errorList = dialog.$summary.find("ul.error-list");
            dialog.$modalBody = dialog.$addEditDialog.find(".modal-body");

            // Create all of the validation rules
            rules = {
                rules: options.validationRules.rules,
                messages: options.validationRules.messages,
                ignore: ".ignore_hidden_errors:hidden",
                errorPlacement: function(error, element) {
                    var $field_error = $(element).parent().parent().find(".error_label_container");
                    $field_error.html(error);
                    $field_error.removeClass("checked");
                    
                },
                highlight: function(element, errorClass) {
                    //$(element).parent().parent().addClass(errorClass);
                    var $field_error = $(element).parent().parent().find(".error_label_container");
                    $field_error.removeClass("checked");
                    $field_error.addClass(errorClass);
                },
                unhighlight: function(element, errorClass) {
                    //$(element).parent().parent().removeClass(errorClass);
                    var $field_error = $(element).parent().parent().find(".error_label_container");
                    $field_error.addClass("checked");
                    $field_error.removeClass(errorClass);
                },
                invalidHandler: function() {
                    dialog.$errorCount.empty();
                    dialog.$summary.show();
                    numErrors = dialog.validator.numberOfInvalids()
                    if (numErrors == 1)
                        dialog.$errorCount.text("1 field is invalid");
                    else
                        dialog.$errorCount.text(numErrors + " fields are invalid");
                },
                errorContainer: "#add_edit_validation_summary",
                success: function(label) {
                    label.html("&nbsp;");
                    label.parent().addClass('checked');
                    $(label).parent().parent().parent().removeClass('error')
                },
                onfocusout: function(element, event) {
                    dialog.validator.form();
                }
            };
            dialog.validator = null;
            // configure the modal hidden event.  Isn't it funny that bootstrap's own shortenting of their name is BS?
            dialog.$addEditDialog.on("hidden.bs.modal", function() {
                // Clear out error summary
                dialog.$errorCount.empty();
                dialog.$errorList.empty();
                dialog.$summary.hide();
                // Destroy the validator if it exists, both to save on resources, and to clear out any leftover junk.
                if (dialog.validator != null) {
                    dialog.validator.destroy()
                    dialog.validator = null;
                }
            });
            // configure the dialog shown event
            dialog.$addEditDialog.on("show.bs.modal", function() {
                Octolapse.Settings.AddEditProfile({ "profileObservable": dialog.profileObservable, "templateName": dialog.templateName  });
                // Adjust the margins, height and position
                // Set title
                dialog.$dialogTitle.text(options.title);

                dialog.$addEditDialog.css({
                    width: 'auto',
                    'margin-left': function() { return -($(this).width() / 2); }
                });
            })
            // Configure the show event
            dialog.$addEditDialog.on("shown.bs.modal", function() {
                dialog.validator = dialog.$addEditForm.validate(rules);
                
                // Remove any click event bindings from the cancel button
                dialog.$cancelButton.unbind("click");
                // Called when the user clicks the cancel button in any add/update dialog
                dialog.$cancelButton.bind("click", function() {
                    // Hide the dialog
                    self.hideAddEditDialog();
                });

                // remove any click event bindings from the defaults button
                dialog.$defaultButton.unbind("click");
                dialog.$defaultButton.bind("click", function() {
                    newProfile = dialog.sender.getResetProfile(Octolapse.Settings.AddEditProfile().profileObservable())
                    Octolapse.Settings.AddEditProfile().profileObservable(newProfile);
                    
                });
                
                // Remove any click event bindings from the save button
                dialog.$saveButton.unbind("click");
                // Called when a user clicks the save button on any add/update dialog.
                dialog.$saveButton.bind("click", function() {
                    if (dialog.$addEditForm.valid()) {
                        // the form is valid, add or update the profile
                        self.addUpdateProfile(Octolapse.Settings.AddEditProfile());
                    }
                    else {
                        // Search for any hidden elements that are invalid
                        console.log("Checking ofr hidden field error");
                        $fieldErrors = dialog.$addEditForm.find('.error_label_container.error')
                        $fieldErrors.each(function (index, element) {
                            // Check to make sure the field is hidden.  If it's not, don't bother showing the parent container.
                            // This can happen if more than one field is invalid in a hidden form
                            $errorContainer = $(element);
                            if (!$errorContainer.is(":visible")) {
                                console.log("Hidden error found, showing");
                                $collapsableContainer = $errorContainer.parents(".collapsible");
                                if ($collapsableContainer.length > 0)
                                    // The containers may be nested, show each
                                    $collapsableContainer.each(function (index, container) {
                                        console.log("Showing the collapsed container");
                                        $(container).show();
                                    });
                            }

                        });



                        // The form is invalid, add a shake animation to inform the user
                        $(dialog.$addEditDialog).addClass('shake');
                        // set a timeout so the dialog stops shaking
                        setTimeout(function () { $(dialog.$addEditDialog).removeClass('shake'); }, 500);
                    }
                    
                });
            });
            // Open the add/edit profile dialog
            dialog.$addEditDialog.modal();
        };
    }
    // Bind the settings view model to the plugin settings element
    OCTOPRINT_VIEWMODELS.push([
        Octolapse.SettingsViewModel
        , ["settingsViewModel"]
        , ["#octolapse_plugin_settings"]
    ]);

    $("#octolapse_settings .toggle").click(function () {
        Octolapse.ToggleElement(this);
    });
});




