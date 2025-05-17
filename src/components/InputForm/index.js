import { useState } from "react";
import PropTypes from "prop-types";
import Checkbox from "@mui/material/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";

function InputForm({
    title = "",
    inputs = [],
    submitText = "Submit",
    showTerms = false,
    termsText = "I agree the",
    termsLinkText = "Terms and Conditions",
    termsLink = "#",
    onSubmit = () => { },
}) {
    const [formValues, setFormValues] = useState({});
    const [termsChecked, setTermsChecked] = useState(false);
    const [controller, dispatch] = useMaterialUIController();
    const { sidenavColor } = controller;

    const handleInputChange = (e) => {
        const { name, type } = e.target;
        
        // Special handling for file inputs
        if (type === 'file') {
            const file = e.target.files[0];
            setFormValues((prev) => ({ ...prev, [name]: file }));
        } else {
            const { value } = e.target;
            setFormValues((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formValues);
    };

    const renderFormField = (input, index) => {
        // Handle file inputs
        if (input.type === 'file') {
            return (
                <MDInput
                    key={index}
                    type="file"
                    label={input.label}
                    name={input.name}
                    onChange={handleInputChange}
                    fullWidth
                    required={input.required}
                    inputProps={{
                        accept: input.accept || '*',
                    }}
                />
            );
        }
        
        // Handle select inputs differently
        if (input.type === "select" && input.options) {
            return (
                <FormControl variant="standard" fullWidth key={index} required={input.required}>
                    <InputLabel id={`${input.name}-label`}>{input.label}</InputLabel>
                    <Select
                        labelId={`${input.name}-label`}
                        id={input.name}
                        name={input.name}
                        value={formValues[input.name] || ""}
                        onChange={handleInputChange}
                        label={input.label}
                    >
                        {input.options.map((option, optIndex) => (
                            <MenuItem key={optIndex} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            );
        }

        // Handle multi-select inputs
        if (input.type === "multiselect" && input.options) {
            return (
                <FormControl variant="standard" fullWidth key={index} required={input.required}>
                    <InputLabel id={`${input.name}-label`}>{input.label}</InputLabel>
                    <Select
                        labelId={`${input.name}-label`}
                        id={input.name}
                        name={input.name}
                        multiple
                        value={formValues[input.name] || []}
                        onChange={(e) => {
                            setFormValues((prev) => ({ ...prev, [input.name]: e.target.value }));
                        }}
                        label={input.label}
                        renderValue={(selected) => (Array.isArray(selected) ? selected.join(", ") : "")}
                    >
                        {input.options.map((option, optIndex) => (
                            <MenuItem key={optIndex} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            );
        }

        // Regular input fields
        return (
            <MDInput
                key={index}
                type={input.type || "text"}
                label={input.label}
                name={input.name}
                variant="standard"
                value={formValues[input.name] || ""}
                onChange={handleInputChange}
                fullWidth
                required={input.required}
                multiline={input.multiline}
                rows={input.rows}
            />
        );
    };

    return (
        <MDBox pt={4} pb={3} px={3}>
            {title && (
                <MDBox
                    variant="gradient"
                    bgColor="info"
                    borderRadius="lg"
                    coloredShadow="info"
                    mx={2}
                    mt={-3}
                    p={2}
                    mb={1}
                    textAlign="center"
                >
                    <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
                        Helello
                    </MDTypography>

                </MDBox>
            )}

            <MDBox component="form" role="form" onSubmit={handleSubmit}>
                {inputs.map((input, index) => (
                    <MDBox key={index} mb={2}>
                        {renderFormField(input, index)}
                    </MDBox>
                ))}

                {showTerms && (
                    <MDBox display="flex" alignItems="center" ml={-1}>
                        <Checkbox
                            checked={termsChecked}
                            onChange={(e) => setTermsChecked(e.target.checked)}
                        />
                        <MDTypography
                            variant="button"
                            fontWeight="regular"
                            color="text"
                            sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                        >
                            &nbsp;&nbsp;{termsText}&nbsp;
                        </MDTypography>
                        <MDTypography
                            component="a"
                            href={termsLink}
                            variant="button"
                            fontWeight="bold"
                            color="info"
                            textGradient
                        >
                            {termsLinkText}
                        </MDTypography>
                    </MDBox>
                )}

                <MDBox mt={4} mb={1}>
                    <MDButton
                        variant="gradient"
                        color={sidenavColor}
                        fullWidth
                        type="submit"
                        disabled={showTerms && !termsChecked}
                    >
                        {submitText}
                    </MDButton>
                </MDBox>
            </MDBox>
        </MDBox>
    );
}

// Typechecking props for the InputForm
InputForm.propTypes = {
    title: PropTypes.string,
    inputs: PropTypes.arrayOf(
        PropTypes.shape({
            type: PropTypes.string,
            name: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            required: PropTypes.bool,
            multiline: PropTypes.bool,
            rows: PropTypes.number,
            options: PropTypes.arrayOf(PropTypes.string) // For select inputs
        })
    ),
    submitText: PropTypes.string,
    showTerms: PropTypes.bool,
    termsText: PropTypes.string,
    termsLinkText: PropTypes.string,
    termsLink: PropTypes.string,
    onSubmit: PropTypes.func
};

export default InputForm;