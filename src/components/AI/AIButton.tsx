import React from "react";
import { Wand2 } from "lucide-react";
import { Button, useMediaQuery } from "@mui/material";

interface AIButtonProps {
  onClick: () => void;
}

const AIButton: React.FC<AIButtonProps> = ({ onClick }) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <Button
      onClick={onClick}
      variant="contained"
      color="primary"
      startIcon={<Wand2 size={20} />}
      size={isMobile ? "small" : "medium"}
      sx={{
        borderRadius: "20px",
        whiteSpace: "nowrap",
        ml: 2,
      }}
    >
      {isMobile ? "AI" : "AI Menu"}
    </Button>
  );
};

export default AIButton;
