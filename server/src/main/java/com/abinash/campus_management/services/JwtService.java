package com.abinash.campus_management.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.security.Key;
import java.security.Security;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    public String generateToken(String userName){
        Map<String, Object> claims = new HashMap<>();
        //    @Value("${secret.expiry}")
        long EXPIRATION_TIME = 10 * 60 * 60 * 24 * 1000;
        return Jwts.builder().claims(claims)
                .subject(userName)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSecurityKey())
                .compact();
    }

    private SecretKey getSecurityKey() {
        //    @Value("${secret.key}")
        String SECRET_KEY = "ThisIsTheSecretKeyForMyApplication";
        byte[] keyBytes =Decoders.BASE64.decode(
                Base64.getEncoder().encodeToString(SECRET_KEY.getBytes())
        );
        return Keys.hmacShaKeyFor(keyBytes);
    }
    public String getUserName(String token){
        return extractClaim(token, Claims::getSubject);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = extractClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractClaims(String token) {
        return Jwts.parser().verifyWith(getSecurityKey()).build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private boolean isExpired(String token){
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    public boolean isValidToken(String token, UserDetails userDetails){
        String name = getUserName(token);
        return name.equals(userDetails.getUsername()) && !isExpired(token);
    }

}
