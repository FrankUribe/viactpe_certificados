DROP PROCEDURE IF EXISTS SP_LOGIN;
CREATE PROCEDURE SP_LOGIN(
	IN $USUARIO VARCHAR(20),
	IN $CONTRA VARCHAR(100)
)
/*
  CALL SP_LOGIN ('FURIBE','$2a$10$et.ppTuL0rxG0o09Wn1pR.KKvHl2HousU4xLNqVXIVo0Abj9Py0ZC')
*/
BEGIN
	DECLARE i INT;
	DECLARE count INT;
  DECLARE exit HANDLER FOR SQLEXCEPTION
  BEGIN
      -- Si ocurre una excepción, seleccionamos el mensaje de error
      GET DIAGNOSTICS CONDITION 1
      @p1 = RETURNED_SQLSTATE, @p2 = MESSAGE_TEXT;
      SELECT @p2 AS MSG, 0 AS RESULTADO;
  END;
  SET collation_connection = 'utf8mb4_general_ci';

  IF ($CONTRA = '') THEN
    IF EXISTS(SELECT * FROM usuarios WHERE UPPER(USUARIO) = UPPER($USUARIO)) THEN
      IF EXISTS(SELECT * FROM usuarios WHERE UPPER(USUARIO) = UPPER($USUARIO) AND ACTIVO = 1) THEN
        SELECT
          *,
          '' AS MSG,
          1 AS RESULTADO
        FROM usuarios
        WHERE UPPER(USUARIO) = UPPER($USUARIO);
      ELSE
        SELECT 'El usuario no se encuentra activo' AS MSG, 0 AS RESULTADO;
      END IF;
    ELSE
      SELECT 'El usuario no existe' AS MSG, 0 AS RESULTADO;
    END IF;
  ELSE
    IF EXISTS(SELECT * FROM usuarios WHERE UPPER(USUARIO) = UPPER($USUARIO)) THEN
      IF EXISTS(SELECT * FROM usuarios WHERE UPPER(USUARIO) = UPPER($USUARIO) AND ACTIVO = 1) THEN
        IF EXISTS(SELECT * FROM usuarios WHERE UPPER(USUARIO) = UPPER($USUARIO) AND ACTIVO = 1 AND CONTRA = $CONTRA) THEN
          SELECT
            *,
            '' AS MSG,
            1 AS RESULTADO
          FROM usuarios
          WHERE UPPER(USUARIO) = UPPER($USUARIO) AND CONTRA = $CONTRA; 
        ELSE
          SELECT 'Contraseña incorrecta' AS MSG, 0 AS RESULTADO;
        END IF;
      ELSE
        SELECT 'El usuario no se encuentra activo' AS MSG, 0 AS RESULTADO;
      END IF;
    ELSE
      SELECT 'El usuario no existe' AS MSG, 0 AS RESULTADO;
    END IF;
  END IF;
END;