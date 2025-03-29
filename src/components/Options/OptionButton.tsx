import React from "react";
import { Button, useMediaQuery } from "@mui/material";
import { OptionButtonProps } from "../../Types/app";

const OptionButton: React.FC<OptionButtonProps> = ({ onClick }) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <Button
      onClick={onClick}
      variant="contained"
      color="primary"
      size={isMobile ? "small" : "medium"}
      sx={{
        borderRadius: "20px",
        whiteSpace: "nowrap",
        ml: 2,
      }}
    >
      {isMobile ? "Menu" : "Option Menu"}
    </Button>
  );
};

export default OptionButton;
