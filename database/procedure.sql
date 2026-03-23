ALTER PROCEDURE [dbo].[sp_Auth_StageRegistration]
    @MaNV NVARCHAR(10),
    @Email NVARCHAR(100),
    @PassEnc NVARCHAR(MAX),
    @HoTen NVARCHAR(200),
    @MaPhg INT,
    @Luong DECIMAL(18,2),
    @ChucVu NVARCHAR(100),
    @OtpCode NVARCHAR(6),
    @ExpiredAt DATETIME
AS
BEGIN
    SET NOCOUNT ON;
    -- Lưu vào bảng chờ xác thực
    MERGE [dbo].[DANG_KY_CHO] AS target
    USING (SELECT @Email AS Email) AS source
    ON (target.Email = source.Email)
    WHEN MATCHED THEN
        UPDATE SET MaNV = @MaNV, PasswordMaHoa = @PassEnc, HoTen = @HoTen, 
                   MaPhg = @MaPhg, Luong = @Luong, ChucVu = @ChucVu, 
                   OtpCode = @OtpCode, ExpiredAt = @ExpiredAt, CreatedAt = GETDATE()
    WHEN NOT MATCHED THEN
        INSERT (MaNV, Email, PasswordMaHoa, HoTen, MaPhg, Luong, ChucVu, OtpCode, ExpiredAt)
        VALUES (@MaNV, @Email, @PassEnc, @HoTen, @MaPhg, @Luong, @ChucVu, @OtpCode, @ExpiredAt);
    
    SELECT 1 AS Success, N'Đã lưu thông tin tạm thời và gửi OTP' AS Message;
END;

ALTER PROCEDURE [dbo].[sp_Auth_VerifyAndActivate]
    @Email NVARCHAR(100),
    @OtpCode NVARCHAR(6)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Kiểm tra OTP
        DECLARE @MaNV NVARCHAR(10), @HoTen NVARCHAR(200), @MaPhg INT, @Luong DECIMAL(18,2), @ChucVu NVARCHAR(100);
        
        SELECT TOP 1 @MaNV = MaNV, @HoTen = HoTen, @MaPhg = MaPhg, @Luong = Luong, @ChucVu = ChucVu
        FROM [dbo].[DANG_KY_CHO]
        WHERE Email = @Email AND OtpCode = @OtpCode AND ExpiredAt > GETDATE();

        IF @MaNV IS NULL
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 0 AS Success, N'Mã OTP không đúng hoặc đã hết hạn' AS Message;
            RETURN;
        END

        -- 2. Tạo USER từ LOGIN (Login này do Nodejs gọi SP ở Master tạo trước đó)
        IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = @Email)
        BEGIN
            DECLARE @Sql NVARCHAR(MAX) = N'CREATE USER ' + QUOTENAME(@Email) + N' FOR LOGIN ' + QUOTENAME(@Email);
            EXEC sp_executesql @Sql;
        END

        -- 3. Gán quyền
        EXEC sp_addrolemember 'db_datareader', @Email;
        EXEC sp_addrolemember 'db_datawriter', @Email;

        -- 4. Chuyển dữ liệu vào bảng NHAN_VIEN chính thức
        INSERT INTO [dbo].[NHAN_VIEN] (MANV, EMAIL, HOTEN, MAPHG, LUONG, CHUCVU, IsVerified)
        VALUES (@MaNV, @Email, @HoTen, @MaPhg, @Luong, @ChucVu, 1);

        -- 5. Xóa dữ liệu tạm
        DELETE FROM [dbo].[DANG_KY_CHO] WHERE Email = @Email;

        COMMIT TRANSACTION;
        SELECT 1 AS Success, N'Xác thực và kích hoạt tài khoản thành công' AS Message;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;


CREATE PROCEDURE [dbo].[sp_DangKyUserMoi]  
    @MaNV NVARCHAR(10),               -- Mã NVXXXX từ Node.js
    @Email NVARCHAR(100),  
    @Password NVARCHAR(50),  -- Vẫn cần để tạo Login hệ thống
    @HoTen NVARCHAR(200),  
    @MaPhg INT,  
    @Luong DECIMAL(18,2) = 0,  
    @ChucVu NVARCHAR(100) = NULL,
    @OtpCode NVARCHAR(6) = NULL,      
    @ExpiredAt DATETIME = NULL       
AS  
BEGIN  
    SET NOCOUNT ON;  
    BEGIN TRY  
        BEGIN TRANSACTION;  
  
        -- 1. Khai báo biến chuỗi SQL động
        DECLARE @SqlLogin NVARCHAR(MAX);
        DECLARE @SqlUser NVARCHAR(MAX);
        DECLARE @SqlRole NVARCHAR(MAX);

        -- 2. Tạo LOGIN hệ thống bằng Email
        SET @SqlLogin = N'CREATE LOGIN ' + QUOTENAME(@Email) +   
                        N' WITH PASSWORD = ''' + REPLACE(@Password, '''', '''''') + N''', ' +  
                        N' DEFAULT_DATABASE = [QuanTriNhanSu], CHECK_POLICY = ON;';  
        EXEC sp_executesql @SqlLogin;  
  
        -- 3. Tạo USER trong Database ứng với Login vừa tạo
        SET @SqlUser = N'CREATE USER ' + QUOTENAME(@Email) + N' FOR LOGIN ' + QUOTENAME(@Email);  
        EXEC sp_executesql @SqlUser;  
  
        -- 4. Gán quyền cơ bản cho User (Đọc/Ghi dữ liệu)
        SET @SqlRole = N'ALTER ROLE [db_datareader] ADD MEMBER ' + QUOTENAME(@Email) + N'; ' +  
                       N'ALTER ROLE [db_datawriter] ADD MEMBER ' + QUOTENAME(@Email) + N';';  
        EXEC sp_executesql @SqlRole;  
  
        -- 5. INSERT vào bảng NHANVIEN (Đã bỏ cột MAT_KHAU)
        INSERT INTO [dbo].[NHANVIEN] (
            MANV, 
            TEN_DANG_NHAP, 
            EMAIL, 
            HOTEN, 
            MAPHG, 
            LUONG, 
            CHUCVU, 
            VerificationCode, 
            CodeExpiredAt, 
            IsVerified
            -- KHÔNG CÓ MAT_KHAU Ở ĐÂY
        )
        VALUES (
            @MaNV, 
            @Email, 
            @Email, 
            ISNULL(@HoTen, @Email), 
            @MaPhg, 
            ISNULL(@Luong, 0), 
            ISNULL(@ChucVu, N'Nhân viên'),
            @OtpCode, 
            @ExpiredAt, 
            0 -- Mặc định chưa xác thực OTP
        );
  
        -- Trả về thông tin để Node.js biết là đã tạo thành công
        SELECT MANV, HOTEN, EMAIL FROM [dbo].[NHANVIEN] WHERE MANV = @MaNV;  
  
        COMMIT TRANSACTION;  
    END TRY  
    BEGIN CATCH  
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;  
        
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg, 16, 1);
    END CATCH  
END;