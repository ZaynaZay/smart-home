const Footer = () => {
  return (
    <footer className="border-t">
      <div className="container mx-auto flex h-16 items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} WellnessHub. Your Personal AI
          Companion.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
