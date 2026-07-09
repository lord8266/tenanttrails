-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: tenanttrails
-- ------------------------------------------------------
-- Server version	8.0.46-0ubuntu0.24.04.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `apartments`
--

DROP TABLE IF EXISTS `apartments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `apartments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `address` varchar(200) NOT NULL,
  `neighbourhood` varchar(80) NOT NULL,
  `landlord` varchar(120) DEFAULT NULL,
  `units` int DEFAULT NULL,
  `built` int DEFAULT NULL,
  `verified` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `apartments`
--

LOCK TABLES `apartments` WRITE;
/*!40000 ALTER TABLE `apartments` DISABLE KEYS */;
INSERT INTO `apartments` VALUES (2,'Le Marchant Towers','1585 Le Marchant St','West End','Killam Properties',88,1975,0),(3,'Fenwick Tower','5599 Fenwick St','Downtown','Templeton Properties',314,1971,0),(4,'Park Victoria','1496 Carlton St','South End','Southwest Properties',60,2015,0),(9,'Test Apt','123 Main St','Downtown','ACME Properties',24,2018,0),(14,'Test Apt','123 Main St','Downtown','ACME Properties',24,2018,0),(16,'Test Apt','123 Main St','Downtown','ACME Properties',24,2018,0);
/*!40000 ALTER TABLE `apartments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attachment`
--

DROP TABLE IF EXISTS `attachment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attachment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `apartment_id` int DEFAULT NULL,
  `review_id` int DEFAULT NULL,
  `url` varchar(500) NOT NULL,
  `type` varchar(50) NOT NULL,
  `created` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `apartment_id` (`apartment_id`),
  KEY `review_id` (`review_id`),
  CONSTRAINT `attachment_apartment_fk` FOREIGN KEY (`apartment_id`) REFERENCES `apartments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attachment_review_fk` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attachment_one_parent` CHECK (((`apartment_id` is null) <> (`review_id` is null)))
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attachment`
--

LOCK TABLES `attachment` WRITE;
/*!40000 ALTER TABLE `attachment` DISABLE KEYS */;
INSERT INTO `attachment` VALUES (8,2,NULL,'https://res.cloudinary.com/dcueyjhlz/image/upload/v1782439066/tenanttrails/glbum1qtxqerrdypiqhj.png','image/png','2026-06-25'),(9,3,NULL,'https://res.cloudinary.com/dcueyjhlz/image/upload/v1782439067/tenanttrails/u499vkdy4uiapjjxohcc.png','image/png','2026-06-25'),(10,4,NULL,'https://res.cloudinary.com/dcueyjhlz/image/upload/v1782439068/tenanttrails/bftjzpx1ab2w0wk3v9lx.png','image/png','2026-06-25'),(11,9,NULL,'https://res.cloudinary.com/dcueyjhlz/image/upload/v1782439069/tenanttrails/g3xvmpkfmn5ysdiyegde.png','image/png','2026-06-25'),(12,14,NULL,'https://res.cloudinary.com/dcueyjhlz/image/upload/v1782439070/tenanttrails/st01iinea1hravhqas7f.png','image/png','2026-06-25'),(13,16,NULL,'https://res.cloudinary.com/dcueyjhlz/image/upload/v1782439066/tenanttrails/glbum1qtxqerrdypiqhj.png','image/png','2026-06-25'),(29,NULL,28,'https://res.cloudinary.com/dcueyjhlz/image/upload/v1782441046/tenanttrails/zczxzjjh5x1fjrtsxr7e.png','image/png','2026-06-25');
/*!40000 ALTER TABLE `attachment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `apt_id` int NOT NULL,
  `user_id` int NOT NULL,
  `rating` tinyint NOT NULL,
  `body` text NOT NULL,
  `created` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `apt_id` (`apt_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`apt_id`) REFERENCES `apartments` (`id`),
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (5,2,2,4,'Responsive management, though parking is a five-month wait.','2026-04-02'),(8,3,1,4,'Incredible 28th-floor view; elevators break down often.','2026-04-12'),(11,4,2,5,'Best rental experience in Halifax. Maintenance is fast.','2026-04-22'),(28,4,19,5,'aaaaa','2026-06-25');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password` varchar(255) NOT NULL,
  `initials` varchar(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Alex Mitchell','alex@dal.ca','password123','AM'),(2,'James Chen','james@example.com','pass','JC'),(6,'Vishwa Pravin','lordvishwa123@gmail.com','$2b$10$4m/O9u9QruenCaoPtEiud.mxfXrOaa9NhiXr7ZBuQK4KJ4ovbM8aO','VP'),(16,'Vishwa','a@g.com','$2b$10$hNnfmOK/uucQKiRGxVcpf.CyzBYckFER61neuBCUp2NrAAMPbMpAe','V'),(17,'vpk','b@g.com','$2b$10$xMKd/XZkuMtUlJNpb2wUc.bD0dvs9sIcMnp3sHBOoYgJlLK7hvCSq','V'),(18,'vpk2','c@g.com','$2b$10$fHieXRVx36dpi2gN48kS1uY3p9TQJIy0.RubLRAc7VfJx3CEr0X/i','V'),(19,'vpk3','d@g.com','$2b$10$kCsxLS0z.WJEdoVl1zSszOVNXkO7kOBmQMmiNKsgMoNA5B0W5RiTu','V'),(20,'vpk5','e@g.com','$2b$10$pX3hqmFmEMub90ijb0JnD.BYQq4YuJ4B4e4TuclbUtkiiEL/ydfLC','V');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-09 13:11:50
