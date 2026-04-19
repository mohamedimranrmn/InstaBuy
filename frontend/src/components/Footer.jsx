function Footer() {
  return (
    <footer style={{
      background: "#1b2a4a",
      color: "#94afd4",
      textAlign: "center",
      padding: "1rem",
      fontFamily: "'Segoe UI', sans-serif",
      fontSize: "0.8rem",
      marginTop: "auto",
    }}>
      © {new Date().getFullYear()} InstaBuy. All rights reserved.
    </footer>
  );
}

export default Footer;