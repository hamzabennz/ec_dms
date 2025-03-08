import { forwardRef } from "react";
import PropTypes from "prop-types";

// @mui material components
import Chip from "@mui/material/Chip";

// Custom styles for MDChip
import MDChipRoot from "components/MDChip/MDChipRoot";

const MDChip = forwardRef(
    ({ color, variant, size, label, onDelete, ...rest }, ref) => (
        <MDChipRoot
            ref={ref}
            ownerState={{ color, variant, size }}
            {...rest}
            render={({ ownerState }) => (
                <Chip
                    label={label}
                    onDelete={onDelete}
                    color={ownerState.color === "default" ? "default" : ownerState.color}
                    variant={variant}
                    size={size}
                />
            )}
        />
    )
);

// Setting default values for the props of MDChip
MDChip.defaultProps = {
    color: "default",
    variant: "contained",
    size: "medium",
    onDelete: null,
};

// Typechecking props for the MDChip
MDChip.propTypes = {
    color: PropTypes.oneOf([
        "primary",
        "secondary",
        "info",
        "success",
        "warning",
        "error",
        "default",
        "dark",
    ]),
    variant: PropTypes.oneOf(["contained", "outlined"]),
    size: PropTypes.oneOf(["small", "medium", "large"]),
    label: PropTypes.string.isRequired,
    onDelete: PropTypes.func,
};

MDChip.displayName = "MDChip";

export default MDChip;