import Container from "@components/Container";

import styles from "./Footer.module.scss";

const Footer = ({ ...rest }) => {
  return (
    <footer className={styles.footer} {...rest}>
      <Container className={`${styles.footerContainer} ${styles.footerLegal}`}>
        <p>
          Made with ❤️ by Prateek kumar Nayak <br />
          <div style={{ textAlign: "center" }}>
            &copy; {new Date().getFullYear()} All rights reserved.
          </div>
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
